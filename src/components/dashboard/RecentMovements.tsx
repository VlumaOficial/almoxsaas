import { ArrowDownCircle, ArrowUpCircle, RefreshCw, ClipboardCheck } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  entrada:       { label: 'Entrada',       icon: <ArrowDownCircle size={14} />, color: 'text-green-600 bg-green-50' },
  saida:         { label: 'Saída',         icon: <ArrowUpCircle size={14} />,   color: 'text-red-600 bg-red-50' },
  transferencia: { label: 'Transferência', icon: <RefreshCw size={14} />,       color: 'text-blue-600 bg-blue-50' },
  inventario:    { label: 'Inventário',    icon: <ClipboardCheck size={14} />,  color: 'text-purple-600 bg-purple-50' },
  ajuste:        { label: 'Ajuste',        icon: <ClipboardCheck size={14} />,  color: 'text-amber-600 bg-amber-50' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  rascunho:  { label: 'Rascunho',  color: 'bg-slate-100 text-slate-600' },
  pendente:  { label: 'Pendente',  color: 'bg-amber-100 text-amber-700' },
  aprovado:  { label: 'Aprovado',  color: 'bg-green-100 text-green-700' },
  rejeitado: { label: 'Rejeitado', color: 'bg-red-100 text-red-700' },
  cancelado: { label: 'Cancelado', color: 'bg-slate-100 text-slate-500' },
}

export function RecentMovements({ movements, loading }: {
  movements: RecentMovement[]
  loading: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900 text-sm">Últimas Movimentações</h2>
      </div>

      {loading ? (
        <div className="p-5 space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : movements.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          Nenhuma movimentação registrada ainda
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Tipo</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Almoxarifado</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Documento</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Data</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov) => {
                const typeConf = TYPE_CONFIG[mov.type] || { label: mov.type, icon: null, color: 'text-slate-600 bg-slate-50' }
                const statusConf = STATUS_CONFIG[mov.status] || { label: mov.status, color: 'bg-slate-100 text-slate-600' }
                return (
                  <tr key={mov.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeConf.color}`}>
                        {typeConf.icon}
                        {typeConf.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{mov.warehouse_name}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {mov.document_number || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {format(new Date(mov.occurred_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConf.color}`}>
                        {statusConf.label}
                      </span>
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