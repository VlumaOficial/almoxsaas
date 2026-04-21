import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
  requireRoles?: Array<'super_admin' | 'owner' | 'manager' | 'operator'>
}

export function AuthGuard({ children, requireRoles }: AuthGuardProps) {
  const { session, profile, company, loading } = useAuth()
  const location = useLocation()

  // DEBUG TEMPORÁRIO - remover após identificar o problema
  console.log('AuthGuard state:', {
    loading,
    hasSession: !!session,
    hasProfile: !!profile,
    hasCompany: !!company,
    path: location.pathname
  })

  // Mostra spinner se loading OU se tem sessão mas perfil ainda não carregou
  if (loading || (session && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  // Sem sessão → login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Tem sessão mas não tem perfil → mostra erro
  if (!profile) {
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

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (session && profile) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}