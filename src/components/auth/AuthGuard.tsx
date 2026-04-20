import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
  requireRoles?: Array<'super_admin' | 'owner' | 'manager' | 'operator'>
}

export function AuthGuard({ children, requireRoles }: AuthGuardProps) {
  const { session, profile, company, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  // Não autenticado no Supabase Auth → login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Autenticado mas sem perfil → Evita loop infinito permitindo ficar no login ou dashboard com erro
  // Só exibe mensagem se loading === false E profile === null para evitar flash visual
  if (!loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Perfil não encontrado</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Sua conta de acesso existe, mas não encontramos seus dados de perfil ou empresa.
            Isso pode acontecer se o cadastro não foi concluído corretamente.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-blue-700 font-medium hover:underline text-sm"
          >
            Tentar fazer login novamente
          </button>
        </div>
      </div>
    )
  }

  // Empresa bloqueada → planos
  if (company?.status === 'blocked' || company?.status === 'cancelled') {
    return <Navigate to="/planos" replace />
  }

  // Trial expirado → planos
  if (company?.status === 'trial') {
    const trialEnd = new Date(company.trial_ends_at)
    if (trialEnd < new Date()) {
      return <Navigate to="/planos" replace />
    }
  }

  // Verificação de role
  if (requireRoles && !requireRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Guard reverso: redireciona autenticados para fora do login
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Só redireciona para o dashboard se tiver SESSÃO e PERFIL
  // Se tiver sessão mas não perfil, deixa ele no login para evitar o loop
  if (session && profile) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}