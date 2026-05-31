import { useState, useMemo, useEffect } from 'react'
import { useMovements, Movement } from '@/hooks/useMovements'
import { useWarehouses } from '@/hooks/useWarehouses'
import { useProjects } from '@/hooks/useProjects'
import { useProducts } from '@/hooks/useProducts'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { MovementWizard } from '@/components/movements/MovementWizard'
import { MovementTable } from '@/components/movements/MovementTable'
import { MovementFilters } from '@/components/movements/MovementFilters'
import { MovementDetailsModal } from '@/components/movements/MovementDetailsModal'
import { ReturnModal } from '@/components/movements/ReturnModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function MovementsPage() {
  const { company } = useAuth()
  const {
    movements, loading, fetchMovements,
    approveMovement, rejectMovement,
    cancelMovement, createReturn
  } = useMovements()

  const { warehouses } = useWarehouses()
  const { projects } = useProjects()
  const { products } = useProducts()

  const [wizardOpen, setWizardOpen] = useState(false)
  const [detailsMovement, setDetailsMovement] = useState<Movement | null>(null)
  const [returnMovement, setReturnMovement] = useState<Movement | null>(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stockMap, setStockMap] = useState<Record<string, number>>({})

  async function loadStockMap() {
    if (!company?.id) return
    const { data } = await supabase
      .from('stock')
      .select('product_id, quantity')
      .eq('company_id', company.id)
    const map: Record<string, number> = {}
    ;(data || []).forEach((s: any) => { map[s.product_id] = s.quantity })
    setStockMap(map)
  }

  useEffect(() => {
    loadStockMap()
  }, [company?.id])

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const matchSearch = !search ||
        m.document_number?.toLowerCase().includes(search.toLowerCase()) ||
        m.movement_items?.some(item =>
          (item.product as any)?.name?.toLowerCase().includes(search.toLowerCase()) ||
          (item.product as any)?.sku?.toLowerCase().includes(search.toLowerCase())
        )
      const matchType = typeFilter === "all" || m.type === typeFilter
      const matchStatus = statusFilter === "all" || m.status === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [movements, search, typeFilter, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Movimentacoes</h2>
          <p className="text-slate-500 text-sm mt-1">
            {movements.length} movimentacao{movements.length !== 1 ? "oes" : ""} registrada{movements.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setWizardOpen(true)} className="bg-blue-800 hover:bg-blue-900">
          <Plus size={16} className="mr-2" /> Nova movimentacao
        </Button>
      </div>

      <MovementFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <MovementTable
        movements={filteredMovements}
        loading={loading}
        onViewDetails={setDetailsMovement}
        onApprove={approveMovement}
        onReject={rejectMovement}
        onCancel={cancelMovement}
        onReturn={setReturnMovement}
      />

      <MovementWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={() => {
          fetchMovements()
          loadStockMap()
        }}
        warehouses={warehouses}
        projects={projects}
        products={products}
        stockMap={stockMap}
      />

      <MovementDetailsModal
        open={!!detailsMovement}
        onClose={() => setDetailsMovement(null)}
        movement={detailsMovement}
      />

      <ReturnModal
        open={!!returnMovement}
        onClose={() => setReturnMovement(null)}
        movement={returnMovement}
        onConfirm={async (items) => {
          if (!returnMovement) return false
          const success = await createReturn(returnMovement, items)
          if (success) {
            setReturnMovement(null)
            fetchMovements()
          }
          return success
        }}
      />
    </div>
  )
}
