import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../integrations/supabase/client'
import { novaSenhaSchema, NovaSenhaForm } from '../../lib/validations'
import { Logo } from '../../components/auth/Logo'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Eye, EyeOff, KeyRound } from 'lucide-react'

export default function NovaSenhaPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<NovaSenhaForm>({
    resolver: zodResolver(novaSenhaSchema),
  })

  async function onSubmit(data: NovaSenhaForm) {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      setError('Não foi possível redefinir a senha. O link pode ter expirado.')
      setLoading(false)
      return
    }

    navigate('/login', { state: { message: 'Senha redefinida com sucesso. Faça login.' } })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Nova senha</h1>
          <p className="text-slate-500 text-sm mb-6">Defina sua nova senha de acesso.</p>

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres" {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm_password">Confirmar nova senha</Label>
              <div className="relative">
                <Input id="confirm_password" type={showConfirm ? 'text' : 'password'}
                  placeholder="Repita a senha" {...register('confirm_password')}
                  className={errors.confirm_password ? 'border-red-500 pr-10' : 'pr-10'} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-red-500 text-xs">{errors.confirm_password.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-900" disabled={loading}>
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                : <KeyRound size={16} className="mr-2" />}
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}