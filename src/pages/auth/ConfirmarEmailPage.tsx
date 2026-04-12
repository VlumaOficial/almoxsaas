import { useLocation, Link } from 'react-router-dom'
import { Logo } from '../../components/auth/Logo'
import { Mail, CheckCircle } from 'lucide-react'

export default function ConfirmarEmailPage() {
  const location = useLocation()
  const email = (location.state as any)?.email || 'seu e-mail'

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

          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Confirme seu e-mail
          </h1>

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