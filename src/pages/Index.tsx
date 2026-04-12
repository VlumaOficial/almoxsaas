import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Index = () => {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}

export default Index;