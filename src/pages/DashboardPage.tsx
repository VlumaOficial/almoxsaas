import { useDashboard } from '../hooks/useDashboard'
import { useAuth } from '../contexts/AuthContext'
import { MetricCard } from '../components/dashboard/MetricCard'
import { StockAlertTable } from '../components/dashboard/StockAlertTable'
import { RecentMovements } from '../components/dashboard/RecentMovements'
import {
  Package, ArrowLeftRight, AlertTriangle, Users
} from 'lucide-react'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { metrics, lowStockItems, recentMovements, loading } = useDashboard()

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuário'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="space-y-6">
      {/* Saudação */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {greeting}, {firstName}! 👋
        </h2>
        <p className="text-slate-500 mt-1">
          Aqui está um resumo do seu almoxarifado hoje.
        </p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Produtos"
          value={metrics.totalProducts}
          subtitle="produtos cadastrados"
          icon={<Package size={20} className="text-blue-700" />}
          iconBg="bg-blue-50"
          loading={loading}
        />
        <MetricCard
          title="Movimentações no Mês"
          value={metrics.movementsThisMonth}
          subtitle="entradas e saídas"
          icon={<ArrowLeftRight size={20} className="text-green-700" />}
          iconBg="bg-green-50"
          loading={loading}
        />
        <MetricCard
          title="Estoque Baixo"
          value={metrics.lowStockCount}
          subtitle="abaixo do mínimo"
          icon={<AlertTriangle size={20} className="text-amber-600" />}
          iconBg="bg-amber-50"
          trend={metrics.lowStockCount > 0 ? 'down' : 'neutral'}
          trendLabel={metrics.lowStockCount > 0 ? '⚠ Requer atenção' : '✓ Tudo em ordem'}
          loading={loading}
        />
        <MetricCard
          title="Usuários Ativos"
          value={metrics.activeUsers}
          subtitle="na sua empresa"
          icon={<Users size={20} className="text-purple-700" />}
          iconBg="bg-purple-50"
          loading={loading}
        />
      </div>

      {/* Tabelas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StockAlertTable items={lowStockItems} loading={loading} />
        <RecentMovements movements={recentMovements} loading={loading} />
      </div>
    </div>
  )
}