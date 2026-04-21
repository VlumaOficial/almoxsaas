import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../../integrations/supabase/client'
import { Logo } from '../../components/auth/Logo'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'

export default function ConfirmarEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as any)?.email || 'seu e-mail'

  const [status, setStatus] = useState<'waiting' | 'confirming' | 'success' | 'error'>('waiting')

  useEffect(() => {
    const hash = window.location.hash
    const search = window.location.search

    // Detecta erro na URL (link expirado, inválido, etc.)
    if (search.includes('error=') || hash.includes('error=')) {
      setStatus('error')
      return
    }

    // Detecta token válido
    if (search.includes('code=') || hash.includes('access_token')) {
      setStatus('confirming')

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            setStatus('success')
            setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
          } else if (event === 'USER_UPDATED') {
            setStatus('success')
            setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
          }
        }
      )

      supabase.auth.exchangeCodeForSession(
        new URLSearchParams(search).get('code') || ''
      ).catch(() => setStatus('error'))

      return () => subscription.unsubscribe()
    }
  }, [])

  // Tela: erro
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-10 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Link inválido ou expirado</h1>
            <p className="text-slate-500 text-sm mb-6">
              O link de confirmação expirou ou já foi utilizado. Faça um novo cadastro.
            </p>
            <Link to="/cadastro" className="text-blue-700 font-medium hover:underline text-sm">
              Voltar ao cadastro
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Tela: processando confirmação
  if (status === 'confirming' || status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-10 shadow-sm">
            {status === 'confirming' ? (
              <>
                <div className="flex justify-center mb-4">
                  <Loader2 size={40} className="text-blue-800 animate-spin" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">Confirmando seu e-mail...</h1>
                <p className="text-slate-500 text-sm mt-2">Aguarde um momento.</p>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle size={36} className="text-green-600" />
                  </div>
                </div>
                <h1 className="text-xl font-bold text-slate-900">E-mail confirmado!</h1>
                <p className="text-slate-500 text-sm mt-2">Redirecionando para o sistema...</p>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Tela padrão: aguardando confirmação (fluxo normal pós-cadastro)
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-10 shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Mail size={32} className="text-blue-800" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Confirme seu e-mail</h1>
          <p className="text-slate-500 mb-6">
            Enviamos um link de confirmação para{' '}
            <span className="font-medium text-slate-900">{email}</span>.
            Clique no link para ativar sua conta e iniciar o período de teste gratuito.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
            <div className="flex gap-3">
              <CheckCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Não recebeu o e-mail?</p>
                <ul className="space-y-1 text-amber-700">
                  <li>• Verifique sua caixa de spam</li>
                  <li>• Aguarde alguns minutos</li>
                  <li>• Certifique-se que o e-mail está correto</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-slate-500 mt-6">
          E-mail errado?{' '}
          <Link to="/cadastro" className="text-blue-700 font-medium hover:underline">
            Voltar ao cadastro
          </Link>
        </p>
      </div>
    </div>
  )
}