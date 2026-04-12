import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, SidebarProvider } from './Sidebar'
import { Topbar } from './Topbar'
import { TrialBanner } from './TrialBanner'

// Mapeamento de rota → título da página
const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/produtos':      'Produtos',
  '/movimentacoes': 'Movimentações',
  '/estoque':       'Estoque',
  '/almoxarifados': 'Almoxarifados',
  '/categorias':    'Categorias',
  '/fornecedores':  'Fornecedores',
  '/usuarios':      'Usuários',
  '/configuracoes': 'Configurações',
  '/admin':         'Administração Global',
}

export function AppLayout() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'Almox'

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar title={title} />
          <TrialBanner />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}