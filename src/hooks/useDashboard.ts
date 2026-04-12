import { useEffect, useState } from 'react'
import { supabase } from '../integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'

interface DashboardMetrics {
  totalProducts: number
  movementsThisMonth: number
  lowStockCount: number
  activeUsers: number
}

interface LowStockItem {
  id: string
  name: string
  sku: string | null
  unit: string
  min_stock: number
  current_stock: number
  warehouse_name: string
}

interface RecentMovement {
  id: string
  type: string
  status: string
  document_number: string | null
  occurred_at: string
  warehouse_name: string
  requested_by_name: string | null
  items_count: number
}

interface DashboardData {
  metrics: DashboardMetrics
  lowStockItems: LowStockItem[]
  recentMovements: RecentMovement[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboard(): DashboardData {
  const { company } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProducts: 0,
    movementsThisMonth: 0,
    lowStockCount: 0,
    activeUsers: 0,
  })
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    if (!company?.id) return
    setLoading(true)
    setError(null)

    try {
      // 1. Métricas de uso (company_usage)
      const { data: usage } = await supabase
        .from('company_usage')
        .select('total_products, movements_this_month, total_users')
        .eq('company_id', company.id)
        .single()

      // 2. Produtos com estoque abaixo do mínimo
      const { data: stockData } = await supabase
        .from('stock')
        .select(`
          quantity,
          product:products(id, name, sku, unit, min_stock),
          warehouse:warehouses(name)
        `)
        .eq('company_id', company.id)

      const lowStock = (stockData || [])
        .filter((s: any) => s.quantity < s.product?.min_stock)
        .map((s: any) => ({
          id: s.product.id,
          name: s.product.name,
          sku: s.product.sku,
          unit: s.product.unit,
          min_stock: s.product.min_stock,
          current_stock: s.quantity,
          warehouse_name: s.warehouse?.name || '-',
        }))

      // 3. Últimas 8 movimentações
      const { data: movData } = await supabase
        .from('movements')
        .select(`
          id, type, status, document_number, occurred_at,
          warehouse:warehouses(name),
          requested_by_profile:profiles!movements_requested_by_fkey(full_name),
          movement_items(id)
        `)
        .eq('company_id', company.id)
        .order('occurred_at', { ascending: false })
        .limit(8)

      const recentMov = (movData || []).map((m: any) => ({
        id: m.id,
        type: m.type,
        status: m.status,
        document_number: m.document_number,
        occurred_at: m.occurred_at,
        warehouse_name: m.warehouse?.name || '-',
        requested_by_name: m.requested_by_profile?.full_name || null,
        items_count: m.movement_items?.length || 0,
      }))

      setMetrics({
        totalProducts: usage?.total_products || 0,
        movementsThisMonth: usage?.movements_this_month || 0,
        lowStockCount: lowStock.length,
        activeUsers: usage?.total_users || 0,
      })
      setLowStockItems(lowStock.slice(0, 5))
      setRecentMovements(recentMov)

    } catch (err: any) {
      setError('Erro ao carregar dados do dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [company?.id])

  return { metrics, lowStockItems, recentMovements, loading, error, refetch: fetchData }
}