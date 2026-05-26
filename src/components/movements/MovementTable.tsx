import { useState } from 'react'
import { Movement } from '@/hooks/useMovements'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, CheckCircle, XCircle, RotateCcw, Ban } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  entrada:       { label: "Entrada",       color: "text-green-700 bg-green-50" },
  saida:         { label: "Saida",         color: "text-red-700 bg-red-50" },
  transferencia: { label: "Transferencia", color: "text-blue-700 bg-blue-50" },
  ajuste:        { label: "Ajuste",        color: "text-amber-700 bg-amber-50" },
  inventario:    { label: "Inventario",    color: "text-purple-700 bg-purple-50" },
  retorno:       { label: "Retorno",       color: "text-slate-700 bg-slate-100" },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pendente:  { label: "Pendente",  color: "bg-amber-100 text-amber-700" },
  aprovado:  { label: "Aprovado",  color: "bg-green-100 text-green-700" },
  rejeitado: { label: "Rejeitado", color: "bg-red-100 text-red-700" },
  cancelado: { label: "Cancelado", color: "bg-slate-100 text-slate-500" },
}

interface MovementTableProps {
  movements: Movement[]
  loading: boolean
  onViewDetails: (movement: Movement) => void
  onApprove: (id: string) => Promise<boolean>
  onReject: (id: string) => Promise<boolean>
  onCancel: (id: string) => Promise<boolean>
  onReturn: (movement: Movement) => void
}

export function MovementTable({
  movements, loading,
  onViewDetails, onApprove, onReject, onCancel, onReturn
}: MovementTableProps) {
  const { profile } = useAuth()
  const [actionId, setActionId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<"reject" | "cancel" | null>(null)

  const isManager = ["manager", "owner", "super_admin"].includes(profile?.role || "")

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
        {[1,2,3,4].map(i => <div key={i} className="h-14 bg-slate-100 rounded animate-pulse" />)}
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {movements.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Nenhuma movimentacao encontrada
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Documento</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Tipo</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Almoxarifado</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Projeto</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Solicitante</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Data</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-500">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {movements.map(mov => {
                  const typeConf = TYPE_CONFIG[mov.type]
                  const statusConf = STATUS_CONFIG[mov.status]
                  const canApprove = isManager && mov.status === "pendente"
                  const canCancel = mov.status === "pendente" &&
                    (mov.requested_by === profile?.id || isManager)
                  const canReturn = mov.status === "aprovado" &&
                    ["saida", "transferencia"].includes(mov.type)

                  return (
                    <tr key={mov.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {mov.document_number}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeConf?.color}`}>
                          {typeConf?.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                        {(mov.warehouse as any)?.name || "-"}
                      </td>
                      <td className="px-5 py-3 text-slate-500 max-w-32 truncate">
                        {(mov.project as any)?.name || <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                        {(mov.requested_by_profile as any)?.full_name || "-"}
                      </td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                        {format(new Date(mov.occurred_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="px-5 py-3">
                        <Badge className={statusConf?.color}>{statusConf?.label}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm"
                            onClick={() => onViewDetails(mov)} title="Ver detalhes">
                            <Eye size={14} />
                          </Button>
                          {canApprove && (
                            <Button variant="ghost" size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => onApprove(mov.id)} title="Aprovar">
                              <CheckCircle size={14} />
                            </Button>
                          )}
                          {canApprove && (
                            <Button variant="ghost" size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => { setActionId(mov.id); setActionType("reject") }}
                              title="Rejeitar">
                              <XCircle size={14} />
                            </Button>
                          )}
                          {canReturn && (
                            <Button variant="ghost" size="sm"
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              onClick={() => onReturn(mov)} title="Registrar retorno">
                              <RotateCcw size={14} />
                            </Button>
                          )}
                          {canCancel && (
                            <Button variant="ghost" size="sm"
                              className="text-slate-500 hover:text-slate-700"
                              onClick={() => { setActionId(mov.id); setActionType("cancel") }}
                              title="Cancelar">
                              <Ban size={14} />
                            </Button>
                          )}
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

      <AlertDialog open={!!actionId} onOpenChange={() => { setActionId(null); setActionType(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "reject" ? "Rejeitar movimentacao?" : "Cancelar movimentacao?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "reject"
                ? "A movimentacao sera rejeitada e o estoque nao sera alterado."
                : "A movimentacao sera cancelada e nao podera ser reativada."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!actionId) return
                if (actionType === "reject") await onReject(actionId)
                else await onCancel(actionId)
                setActionId(null)
                setActionType(null)
              }}>
              {actionType === "reject" ? "Rejeitar" : "Cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
