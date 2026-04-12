import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { AuthProvider } from './contexts/AuthContext'
import { AuthGuard, GuestGuard } from './components/auth/AuthGuard'

import LoginPage          from './pages/auth/LoginPage'
import CadastroPage       from './pages/auth/CadastroPage'
import ConfirmarEmailPage from './pages/auth/ConfirmarEmailPage'
import RecuperarSenhaPage from './pages/auth/RecuperarSenhaPage'
import NovaSenhaPage      from './pages/auth/NovaSenhaPage'
import DashboardPage      from './pages/DashboardPage'
import PlanosPage         from './pages/PlanosPage'

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
              {/* Rota raiz → redireciona para login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Rotas públicas (apenas para não autenticados) */}
              <Route path="/login" element={
                <GuestGuard><LoginPage /></GuestGuard>
              } />
              <Route path="/cadastro" element={
                <GuestGuard><CadastroPage /></GuestGuard>
              } />
              <Route path="/confirmar-email" element={<ConfirmarEmailPage />} />
              <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
              <Route path="/nova-senha" element={<NovaSenhaPage />} />

              {/* Rotas protegidas */}
              <Route path="/dashboard" element={
                <AuthGuard><DashboardPage /></AuthGuard>
              } />
              <Route path="/planos" element={<PlanosPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}