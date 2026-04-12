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
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirmar-email`,
          data: { full_name: data.company_name },
        },
      })

      if (authError) throw new Error(authError.message)
      if (!authData.user) throw new Error('Erro ao criar usuário')

      // 2. Criar empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: data.company_name,
          email: data.email,
          cnpj: data.cnpj || null,
          status: 'trial',
          plan: 'starter',
          trial_ends_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          is_email_verified: false,
        })
        .select()
        .single()

      if (companyError) throw new Error('Erro ao criar empresa')

      // 3. Criar perfil do owner
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          company_id: company.id,
          full_name: data.company_name,
          email: data.email,
          role: 'owner',
          is_active: true,
        })

      if (profileError) throw new Error('Erro ao criar perfil')

      // 4. Criar registro de usage
      await supabase.from('company_usage').insert({
        company_id: company.id,
        total_products: 0,
        movements_this_month: 0,
        total_users: 1,
      })

      navigate('/confirmar-email', { state: { email: data.email } })

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.')
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