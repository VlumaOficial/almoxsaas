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

  // Não autenticado → login
  if (!session || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />
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
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (session) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}