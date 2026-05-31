import { useState, useMemo } from "react"
import { useStock } from "@/hooks/useStock"
import { useWarehouses } from "@/hooks/useWarehouses"
import { StockSummaryCards } from "@/components/stock/StockSummaryCards"
import { StockFilters } from "@/components/stock/StockFilters"
import { StockConsolidatedTable } from "@/components/stock/StockConsolidatedTable"
import { StockByWarehouseTable } from "@/components/stock/StockByWarehouseTable"
import { StockHistoryModal } from "@/components/stock/StockHistoryModal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StockPage() {
  const {
    stockItems, stockByWarehouse, summary, loading
  } = useStock()

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

  const filteredConsolidated = useMemo(() => {
    return stockItems.filter(item => {
      const matchSearch = !search ||
        item.product_name.toLowerCase().includes(search.toLowerCase()) ||
        item.product_sku?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" || item.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [stockItems, search, statusFilter])

  const filteredByWarehouse = useMemo(() => {
    return stockByWarehouse.filter(item => {
      const matchSearch = !search ||
        item.product_name.toLowerCase().includes(search.toLowerCase()) ||
        item.product_sku?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" || item.status === statusFilter
      const matchWarehouse = warehouseFilter === "all" || item.warehouse_id === warehouseFilter
      return matchSearch && matchStatus && matchWarehouse
    })
  }, [stockByWarehouse, search, statusFilter, warehouseFilter])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Estoque</h2>
        <p className="text-slate-500 text-sm mt-1">
          Visao consolidada e por almoxarifado
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

      <Tabs defaultValue="consolidado">
        <TabsList>
          <TabsTrigger value="consolidado">
            Consolidado ({filteredConsolidated.length})
          </TabsTrigger>
          <TabsTrigger value="por-almoxarifado">
            Por almoxarifado ({filteredByWarehouse.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consolidado" className="mt-4">
          <StockConsolidatedTable
            items={filteredConsolidated}
            loading={loading}
            onViewHistory={handleViewHistory}
          />
        </TabsContent>

        <TabsContent value="por-almoxarifado" className="mt-4">
          <StockByWarehouseTable
            items={filteredByWarehouse}
            loading={loading}
            onViewHistory={handleViewHistory}
          />
        </TabsContent>
      </Tabs>

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