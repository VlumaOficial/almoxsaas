import { useState, useMemo } from "react"
import { useStock } from "@/hooks/useStock"
import { useWarehouses } from "@/hooks/useWarehouses"
import { StockSummaryCards } from "@/components/stock/StockSummaryCards"
import { StockFilters } from "@/components/stock/StockFilters"
import { StockConsolidatedTable } from "@/components/stock/StockConsolidatedTable"
import { StockHistoryModal } from "@/components/stock/StockHistoryModal"

export default function StockPage() {
  const { stockItems, summary, loading } = useStock()
  const { warehouses } = useWarehouses()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [warehouseFilter, setWarehouseFilter] = useState("all")
  const [criticalActive, setCriticalActive] = useState(false)
  const [historyProductId, setHistoryProductId] = useState<string | null>(null)
  const [historyProductName, setHistoryProductName] = useState<string | null>(null)

  function handleFilterCritical() {
    const next = !criticalActive
    setCriticalActive(next)
    setStatusFilter(next ? "baixo" : "all")
  }

  function handleViewHistory(productId: string, productName: string) {
    setHistoryProductId(productId)
    setHistoryProductName(productName)
  }

  const filteredItems = useMemo(() => {
    return stockItems.filter(item => {
      const matchSearch = !search ||
        item.product_name.toLowerCase().includes(search.toLowerCase()) ||
        item.product_sku?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" || item.status === statusFilter
      const matchWarehouse = warehouseFilter === "all" ||
        item.warehouses.some(w => w.warehouse_id === warehouseFilter)
      return matchSearch && matchStatus && matchWarehouse
    })
  }, [stockItems, search, statusFilter, warehouseFilter])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Estoque</h2>
        <p className="text-slate-500 text-sm mt-1">
          {stockItems.length} produto{stockItems.length !== 1 ? "s" : ""} cadastrado{stockItems.length !== 1 ? "s" : ""}
        </p>
      </div>

      <StockSummaryCards
        summary={summary}
        loading={loading}
        onFilterCritical={handleFilterCritical}
        criticalActive={criticalActive}
      />

      <StockFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        warehouseFilter={warehouseFilter}
        onWarehouseChange={setWarehouseFilter}
        warehouses={warehouses}
      />

      <StockConsolidatedTable
        items={filteredItems}
        loading={loading}
        onViewHistory={handleViewHistory}
        warehouseFilter={warehouseFilter}
      />

      <StockHistoryModal
        open={!!historyProductId}
        onClose={() => {
          setHistoryProductId(null)
          setHistoryProductName(null)
        }}
        productId={historyProductId}
        productName={historyProductName}
      />
    </div>
  )
}