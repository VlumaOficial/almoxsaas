import { useEffect, useState } from "react"
import { useStock, StockMovementHistory } from "@/hooks/useStock"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  entrada:       { label: "Entrada",       color: "text-green-700 bg-green-50" },
  saida:         { label: "Saida",         color: "text-red-700 bg-red-50" },
  transferencia: { label: "Transferencia", color: "text-blue-700 bg-blue-50" },
  ajuste:        { label: "Ajuste",        color: "text-amber-700 bg-amber-50" },
  inventario:    { label: "Inventario",    color: "text-purple-700 bg-purple-50" },
  retorno:       { label: "Retorno",       color: "text-slate-700 bg-slate-100" },
}

interface StockHistoryModalProps {
  open: boolean
  onClose: () => void
  productId: string | null
  productName: string | null
}

export function StockHistoryModal({
  open, onClose, productId, productName
}: StockHistoryModalProps) {
  const { fetchProductHistory } = useStock()
  const [history, setHistory] = useState<StockMovementHistory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !productId) return
    setLoading(true)
    fetchProductHistory(productId).then(data => {
      setHistory(data)
      setLoading(false)
    })
  }, [open, productId])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Historico de Movimentacoes
            {productName && (
              <span className="block text-sm font-normal text-slate-500 mt-1">
                {productName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Carregando historico...
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Nenhuma movimentacao encontrada para este produto
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500 whitespace-nowrap">Documento</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Almoxarifado</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500">Quantidade</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 whitespace-nowrap">Solicitante</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Data</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => {
                  const typeConf = TYPE_CONFIG[h.type] ||
                    { label: h.type, color: "text-slate-700 bg-slate-100" }
                  return (
                    <tr key={i}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {h.document_number || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeConf.color}`}>
                          {typeConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{h.warehouse_name}</td>
                      <td className="px-4 py-3 text-center font-medium text-slate-900">
                        {h.quantity}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {h.requested_by_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {format(new Date(h.occurred_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}