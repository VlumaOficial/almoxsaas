import { StockByWarehouse } from "@/hooks/useStock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  normal:  { label: "Normal",           color: "bg-green-100 text-green-700" },
  baixo:   { label: "Abaixo do minimo", color: "bg-amber-100 text-amber-700" },
  zerado:  { label: "Zerado",           color: "bg-red-100 text-red-700" },
}

interface StockByWarehouseTableProps {
  items: StockByWarehouse[]
  loading: boolean
  onViewHistory: (productId: string, productName: string) => void
}

export function StockByWarehouseTable({
  items, loading, onViewHistory
}: StockByWarehouseTableProps) {
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
                <th className="text-left px-5 py-3 font-medium text-slate-500">Produto</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Almoxarifado</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Localizacao</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Categoria</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Quantidade</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Est. Minimo</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Valor</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500">Status</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const statusConf = STATUS_CONFIG[item.status]
                const rowBg = item.status === "zerado"
                  ? "bg-red-50"
                  : item.status === "baixo"
                  ? "bg-amber-50"
                  : ""

                return (
                  <tr key={`${item.product_id}-${item.warehouse_id}-${index}`}
                    className={cn("border-b border-slate-100 last:border-0 hover:bg-slate-50", rowBg)}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{item.product_name}</p>
                      {item.product_sku && (
                        <p className="text-xs text-slate-400">{item.product_sku}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                      {item.warehouse_name}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {item.location || <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {item.category_name || <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-5 py-3 text-center font-medium text-slate-900">
                      {item.quantity} {item.product_unit}
                    </td>
                    <td className="px-5 py-3 text-center text-slate-500">
                      {item.min_stock} {item.product_unit}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-700">
                      {item.value > 0
                        ? item.value.toLocaleString("pt-BR", {
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
                          onClick={() => onViewHistory(item.product_id, item.product_name)}
                          title="Ver historico">
                          <History size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}