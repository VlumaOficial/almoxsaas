import { useState, createContext, useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Logo } from '../auth/Logo'
import {
  LayoutDashboard, Package, ArrowLeftRight, Warehouse,
  Tag, Truck, Users, Settings, ShieldCheck,
  ChevronLeft, ChevronRight, ClipboardList
} from 'lucide-react'
import { cn } from '../../lib/utils'

// Contexto para sidebar (acessível pelo Topbar)
interface SidebarContextType {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}
export const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
})
export const useSidebar = () => useContext(SidebarContext)

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  roles: Array<'super_admin' | 'owner' | 'manager' | 'operator'>
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',      path: '/dashboard',      icon: <LayoutDashboard size={18} />, roles: ['super_admin','owner','manager','operator'] },
  { label: 'Produtos',       path: '/produtos',        icon: <Package size={18} />,         roles: ['super_admin','owner','manager','operator'] },
  { label: 'Movimentações',  path: '/movimentacoes',   icon: <ArrowLeftRight size={18} />,  roles: ['super_admin','owner','manager','operator'] },
  { label: 'Estoque',        path: '/estoque',         icon: <ClipboardList size={18} />,   roles: ['super_admin','owner','manager','operator'] },
  { label: 'Almoxarifados',  path: '/almoxarifados',   icon: <Warehouse size={18} />,       roles: ['super_admin','owner','manager'] },
  { label: 'Categorias',     path: '/categorias',      icon: <Tag size={18} />,             roles: ['super_admin','owner','manager'] },
  { label: 'Fornecedores',   path: '/fornecedores',    icon: <Truck size={18} />,           roles: ['super_admin','owner','manager'] },
  { label: 'Usuários',       path: '/usuarios',        icon: <Users size={18} />,           roles: ['super_admin','owner'] },
  { label: 'Configurações',  path: '/configuracoes',   icon: <Settings size={18} />,        roles: ['super_admin','owner'] },
  { label: 'Admin Global',   path: '/admin',           icon: <ShieldCheck size={18} />,     roles: ['super_admin'] },
]

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar() {
  const { profile } = useAuth()
  const { collapsed, setCollapsed } = useSidebar()
  const location = useLocation()

  const filteredItems = NAV_ITEMS.filter(item =>
    profile?.role && item.roles.includes(profile.role)
  )

  return (
    <aside className={cn(
      'relative flex flex-col bg-blue-900 text-white transition-all duration-300 shrink-0',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-[60px] px-4 border-b border-blue-800',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && <Logo size="sm" variant="light" />}
        {collapsed && (
          <div className="bg-white/10 p-1.5 rounded-lg">
            <Package size={20} />
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Botão colapsar */}
      <div className="p-3 border-t border-blue-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-blue-200',
            'hover:bg-white/10 hover:text-white transition-colors text-sm',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}