import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../integrations/supabase/client'
import { loginSchema, LoginForm } from '../../lib/validations'
import { Logo } from '../../components/auth/Logo'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setError('E-mail ou senha incorretos. Verifique seus dados e tente novamente.')
      setLoading(false)
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Painel esquerdo — visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-800 flex-col justify-between p-12">
        <Logo size="lg" variant="light" />
        <div className="text-white">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Controle seu estoque com simplicidade e eficiência
          </h2>
          <p className="text-blue-200 text-lg">
            Gerencie entradas, saídas e inventário em um único lugar.
          </p>
        </div>
        <p className="text-blue-300 text-sm">© {new Date().getFullYear()} Almox · Todos os direitos reservados</p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Entrar na sua conta</h1>
            <p className="text-slate-500 mt-1">Bem-vindo de volta</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  to="/recuperar-senha"
                  className="text-xs text-blue-700 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <LogIn size={16} className="mr-2" />
              )}
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="text-blue-700 font-medium hover:underline">
              Cadastre sua empresa
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}