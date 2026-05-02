import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { AuthProvider } from './contexts/AuthContext'
import { AuthGuard, GuestGuard } from './components/auth/AuthGuard'
import { AppLayout } from './components/layout/AppLayout'

// Páginas de auth
import LoginPage          from './pages/auth/LoginPage'
import CadastroPage       from './pages/auth/CadastroPage'
import ConfirmarEmailPage from './pages/auth/ConfirmarEmailPage'
import RecuperarSenhaPage from './pages/auth/RecuperarSenhaPage'
import NovaSenhaPage      from './pages/auth/NovaSenhaPage'

// Páginas internas
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import WarehousesPage from './pages/WarehousesPage'
import SuppliersPage from './pages/SuppliersPage'
import PlanosPage from './pages/PlanosPage'
import AdminPage from './pages/AdminPage'

// Placeholders para fases futuras
const PlaceholderPage = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <p className="text-2xl font-bold text-slate-300">{name}</p>
      <p className="text-slate-400 text-sm mt-1">Em construção</p>
    </div>
  </div>
)

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Rotas públicas */}
              <Route path="/login"           element={<GuestGuard><LoginPage /></GuestGuard>} />
              <Route path="/cadastro"        element={<GuestGuard><CadastroPage /></GuestGuard>} />
              <Route path="/confirmar-email" element={<ConfirmarEmailPage />} />
              <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
              <Route path="/nova-senha"      element={<NovaSenhaPage />} />

              {/* Rotas protegidas com AppLayout */}
              <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"     element={<DashboardPage />} />
                <Route path="/produtos"      element={<ProductsPage />} />
                <Route path="/movimentacoes" element={<PlaceholderPage name="Movimentações" />} />
                <Route path="/estoque"       element={<PlaceholderPage name="Estoque" />} />
                <Route path="/almoxarifados" element={<WarehousesPage />} />
                <Route path="/categorias"    element={<CategoriesPage />} />
                <Route path="/fornecedores"  element={<SuppliersPage />} />
                <Route path="/usuarios"      element={<PlaceholderPage name="Usuários" />} />
                <Route path="/configuracoes" element={<PlaceholderPage name="Configurações" />} />
                <Route path="/admin"         element={<AdminPage />} />
              </Route>

              <Route path="/planos" element={<PlanosPage />} />

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}