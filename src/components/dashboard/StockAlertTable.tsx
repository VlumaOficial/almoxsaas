import { AlertTriangle } from 'lucide-react'

interface LowStockItem {
  id: string
  name: string
  sku: string | null
  unit: string
  min_stock: number
  current_stock: number
  warehouse_name: string
}

export function StockAlertTable({ items, loading }: {
  items: LowStockItem[]
  loading: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <AlertTriangle size={16} className="text-amber-500" />
        <h2 className="font-semibold text-slate-900 text-sm">Estoque Baixo</h2>
        {items.length > 0 && (
          <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="p-5 space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          ✅ Nenhum produto com estoque abaixo do mínimo
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Produto</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Almoxarifado</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Atual</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {item.sku && <p className="text-xs text-slate-400">{item.sku}</p>}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{item.warehouse_name}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-bold text-red-600">
                      {item.current_stock} {item.unit}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-500">
                    {item.min_stock} {item.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}