import { useState, useEffect } from "react"
import { StockItem } from "@/hooks/useStock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { History, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  normal:  { label: "Normal",           color: "bg-green-100 text-green-700" },
  baixo:   { label: "Abaixo do minimo", color: "bg-amber-100 text-amber-700" },
  zerado:  { label: "Zerado",           color: "bg-red-100 text-red-700" },
}

interface StockConsolidatedTableProps {
  items: StockItem[]
  loading: boolean
  onViewHistory: (productId: string, productName: string) => void
  warehouseFilter?: string
}

export function StockConsolidatedTable({
  items, loading, onViewHistory, warehouseFilter
}: StockConsolidatedTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Quando filtro de almoxarifado ativo, expandir automaticamente
  useEffect(() => {
    if (warehouseFilter && warehouseFilter !== 'all') {
      // Expandir todos quando filtro de almoxarifado ativo
      setExpandedId('all')
    } else {
      setExpandedId(null)
    }
  }, [warehouseFilter])

  // Na linha de expansão, filtrar por almoxarifado se filtro ativo
  const getVisibleWarehouses = (item: StockItem) => {
    if (!warehouseFilter || warehouseFilter === 'all') return item.warehouses
    return item.warehouses.filter(w => w.warehouse_id === warehouseFilter)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {items.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Nenhum produto encontrado
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-3 py-3 font-medium text-slate-500 w-8"></th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Produto</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Categoria</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Qtd. Total</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Est. Minimo</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Valor em Estoque</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500">Status</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const statusConf = STATUS_CONFIG[item.status]
                const isExpanded = expandedId === item.product_id || expandedId === 'all'
                const visibleWarehouses = getVisibleWarehouses(item)
                const rowBg = item.status === "zerado"
                  ? "bg-red-50"
                  : item.status === "baixo"
                  ? "bg-amber-50"
                  : ""

                return (
                  <>
                    <tr
                      key={item.product_id}
                      className={cn("border-b border-slate-100 hover:bg-slate-50 cursor-pointer", rowBg)}
                      onClick={() => setExpandedId(isExpanded ? null : item.product_id)}
                    >
                      <td className="px-3 py-3 text-slate-400">
                        {visibleWarehouses.length > 0
                          ? isExpanded
                            ? <ChevronDown size={14} />
                            : <ChevronRight size={14} />
                          : null}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{item.product_name}</p>
                        {item.product_sku && (
                          <p className="text-xs text-slate-400">{item.product_sku}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {item.category_name || <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-5 py-3 text-center font-medium text-slate-900">
                        {item.total_quantity} {item.product_unit}
                      </td>
                      <td className="px-5 py-3 text-center text-slate-500">
                        {item.min_stock} {item.product_unit}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-700">
                        {item.total_value > 0
                          ? item.total_value.toLocaleString("pt-BR", {
                              style: "currency", currency: "BRL"
                            })
                          : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Badge className={statusConf.color}>{statusConf.label}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm"
                            onClick={e => {
                              e.stopPropagation()
                              onViewHistory(item.product_id, item.product_name)
                            }}
                            title="Ver historico">
                            <History size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && visibleWarehouses.map(w => (
                      <tr key={`${item.product_id}-${w.warehouse_id}`}
                        className="border-b border-slate-100 bg-slate-50">
                        <td className="px-3 py-2"></td>
                        <td className="px-5 py-2 pl-8">
                          <p className="text-xs text-slate-500">- {w.warehouse_name}</p>
                          {w.location && (
                            <p className="text-xs text-slate-400">{w.location}</p>
                          )}
                        </td>
                        <td className="px-5 py-2 text-slate-400 text-xs">-</td>
                        <td className="px-5 py-2 text-center text-xs font-medium text-slate-700">
                          {w.quantity} {item.product_unit}
                        </td>
                        <td className="px-5 py-2 text-center text-xs text-slate-400">-</td>
                        <td className="px-5 py-2 text-right text-xs text-slate-500">
                          {item.cost_price
                            ? (w.quantity * item.cost_price).toLocaleString("pt-BR", {
                                style: "currency", currency: "BRL"
                              })
                            : "-"}
                        </td>
                        <td className="px-5 py-2"></td>
                        <td className="px-5 py-2"></td>
                      </tr>
                    ))}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}