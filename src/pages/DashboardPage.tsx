import { useAuth } from '../contexts/AuthContext'
import { Logo } from '../components/auth/Logo'
import { Button } from '../components/ui/button'
import { LogOut } from 'lucide-react'

export default function DashboardPage() {
  const { profile, company, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{profile?.full_name}</p>
            <p className="text-xs text-slate-500">{company?.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut size={14} className="mr-1" /> Sair
          </Button>
        </div>
      </header>
      <main className="flex items-center justify-center h-[calc(100vh-73px)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Bem-vindo, {profile?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500">Dashboard em construção. Fase 4 em breve.</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <span className="text-amber-700 text-sm font-medium">
              Plano: {company?.plan?.toUpperCase()} · Status: {company?.status?.toUpperCase()}
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}