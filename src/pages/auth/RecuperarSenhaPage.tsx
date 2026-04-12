import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../integrations/supabase/client'
import { recuperarSenhaSchema, RecuperarSenhaForm } from '../../lib/validations'
import { Logo } from '../../components/auth/Logo'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Mail, ArrowLeft } from 'lucide-react'

export default function RecuperarSenhaPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<RecuperarSenhaForm>({
    resolver: zodResolver(recuperarSenhaSchema),
  })

  async function onSubmit(data: RecuperarSenhaForm) {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    })

    if (error) {
      setError('Erro ao enviar e-mail. Verifique o endereço informado.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                  <Mail size={28} className="text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">E-mail enviado!</h2>
              <p className="text-slate-500 text-sm">
                Enviamos as instruções para <strong>{getValues('email')}</strong>.
                Verifique sua caixa de entrada e spam.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Recuperar senha</h1>
              <p className="text-slate-500 text-sm mb-6">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              {error && (
                <Alert variant="destructive" className="mb-5">
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

                <Button
                  type="submit"
                  className="w-full bg-blue-800 hover:bg-blue-900"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Mail size={16} className="mr-2" />
                  )}
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </Button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-blue-700 hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  )
}