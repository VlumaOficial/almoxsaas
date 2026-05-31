import { StockSummary } from "@/hooks/useStock"
import { Package, AlertTriangle, XCircle, DollarSign } from "lucide-react"

interface StockSummaryCardsProps {
  summary: StockSummary
  loading: boolean
  onFilterCritical: () => void
  criticalActive: boolean
}

export function StockSummaryCards({
  summary, loading, onFilterCritical, criticalActive
}: StockSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Package size={20} className="text-blue-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{summary.totalProducts}</p>
            <p className="text-xs text-slate-500">Total de produtos</p>
          </div>
        </div>
      </div>

      <button
        onClick={onFilterCritical}
        className={`rounded-xl border shadow-sm p-4 text-left transition-colors ${
          criticalActive
            ? "bg-amber-50 border-amber-300"
            : "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700">{summary.lowStock}</p>
            <p className="text-xs text-amber-600">Abaixo do minimo</p>
          </div>
        </div>
        {criticalActive && (
          <p className="text-xs text-amber-600 mt-2 font-medium">Filtro ativo</p>
        )}
      </button>

      <button
        onClick={onFilterCritical}
        className={`rounded-xl border shadow-sm p-4 text-left transition-colors ${
          criticalActive
            ? "bg-red-50 border-red-300"
            : "bg-white border-slate-200 hover:border-red-300 hover:bg-red-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <XCircle size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-700">{summary.zeroStock}</p>
            <p className="text-xs text-red-600">Estoque zerado</p>
          </div>
        </div>
        {criticalActive && (
          <p className="text-xs text-red-600 mt-2 font-medium">Filtro ativo</p>
        )}
      </button>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <DollarSign size={20} className="text-green-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {summary.totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
            <p className="text-xs text-slate-500">Valor total em estoque</p>
          </div>
        </div>
      </div>
    </div>
  )
}
