import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../integrations/supabase/client'
import { cadastroSchema, CadastroForm } from '../../lib/validations'
import { Logo } from '../../components/auth/Logo'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Eye, EyeOff, Building2 } from 'lucide-react'

export default function CadastroPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSchema),
  })

  async function onSubmit(data: CadastroForm) {
    setLoading(true)
    setError(null)

    try {
      // No Supabase com confirmação de e-mail, não conseguimos inserir em tabelas RLS 
      // imediatamente após o signUp porque a sessão ainda não é 'authenticated'.
      // A solução ideal é usar uma Edge Function ou Triggers no banco.
      
      // 1. Criar usuário no Supabase Auth com metadados
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirmar-email`,
          data: { 
            full_name: data.company_name,
            company_name: data.company_name,
            cnpj: data.cnpj || null
          },
        },
      })

      if (authError) throw new Error(authError.message)
      if (!authData.user) throw new Error('Erro ao criar usuário')

      // Se o usuário já estiver logado (auto-confirm), tentamos criar a empresa.
      // Se não, o trigger 'handle_new_user' no banco (se configurado) cuidaria disso,
      // ou o usuário criará ao entrar pela primeira vez.
      
      // Para este fluxo, vamos apenas redirecionar para a tela de confirmação.
      // Os registros de Empresa/Perfil devem ser criados via Trigger no Postgres 
      // para garantir atomicidade e burlar o RLS inicial.
      
      // NOTA: Se futuramente INSERTs diretos forem adicionados aqui, use try-catch aninhado
      // com signOut() no catch para fazer rollback e evitar usuários órfãos.
      
      navigate('/confirmar-email', { state: { email: data.email } })

    } catch (err: any) {
      // Rollback: se houver erro após criar usuário Auth, fazer signOut para evitar usuário órfão
      await supabase.auth.signOut()
      
      setError(err.message || 'Ocorreu um erro ao criar sua conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Logo size="lg" />
          <h1 className="text-2xl font-bold text-slate-900 mt-6">Cadastre sua empresa</h1>
          <p className="text-slate-500 mt-1 text-center">
            15 dias grátis, sem cartão de crédito
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div className="space-y-1.5">
              <Label htmlFor="company_name">Nome da empresa *</Label>
              <Input
                id="company_name"
                placeholder="Empresa Ltda."
                {...register('company_name')}
                className={errors.company_name ? 'border-red-500' : ''}
              />
              {errors.company_name && (
                <p className="text-red-500 text-xs">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cnpj">CNPJ <span className="text-slate-400">(opcional)</span></Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                {...register('cnpj')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@empresa.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm_password">Confirmar senha *</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  {...register('confirm_password')}
                  className={errors.confirm_password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-500 text-xs">{errors.confirm_password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900 mt-2"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Building2 size={16} className="mr-2" />
              )}
              {loading ? 'Cadastrando...' : 'Criar conta grátis'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-blue-700 font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}