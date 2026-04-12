import { useAuth } from '../../contexts/AuthContext'
import { useSidebar } from './Sidebar'
import { Button } from '../ui/button'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { LogOut, User, ChevronDown, Clock } from 'lucide-react'

interface TopbarProps {
  title: string
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  owner: 'Administrador',
  manager: 'Gestor',
  operator: 'Operador',
}

export function Topbar({ title }: TopbarProps) {
  const { profile, company, signOut } = useAuth()
  const { collapsed } = useSidebar()

  // Calcula dias restantes do trial
  const trialDaysLeft = company?.status === 'trial'
    ? Math.max(0, Math.ceil(
        (new Date(company.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    : null

  return (
    <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {trialDaysLeft !== null && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full
            ${trialDaysLeft <= 3
              ? 'bg-red-100 text-red-700'
              : 'bg-amber-100 text-amber-700'}`}>
            <Clock size={11} />
            Trial: {trialDaysLeft} dia{trialDaysLeft !== 1 ? 's' : ''} restante{trialDaysLeft !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-9 px-3">
            <div className="w-7 h-7 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-bold">
              {profile?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-900 leading-none">
                {profile?.full_name?.split(' ')[0]}
              </p>
              <p className="text-xs text-slate-500 leading-none mt-0.5">
                {profile?.role ? ROLE_LABELS[profile.role] : ''}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>
            <p className="font-medium">{profile?.full_name}</p>
            <p className="text-xs text-slate-500 font-normal">{company?.name}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <User size={14} className="mr-2" /> Meu perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={signOut}
          >
            <LogOut size={14} className="mr-2" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}