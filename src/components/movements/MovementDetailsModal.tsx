import { useEffect, useState, useRef } from 'react'
import { Movement } from '@/hooks/useMovements'
import { useMovementAttachments, MovementAttachment } from '@/hooks/useMovementAttachments'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Upload, FileText, Trash2, Download } from 'lucide-react'

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

interface MovementDetailsModalProps {
  open: boolean
  onClose: () => void
  movement: Movement | null
}

export function MovementDetailsModal({ open, onClose, movement }: MovementDetailsModalProps) {
  const { fetchAttachments, uploadAttachment, deleteAttachment, uploading } = useMovementAttachments()
  const [attachments, setAttachments] = useState<MovementAttachment[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open || !movement) return
    fetchAttachments(movement.id).then(setAttachments)
  }, [open, movement?.id])

  async function handleUpload(file: File) {
    if (!movement) return
    const result = await uploadAttachment(movement.id, file)
    if (result) setAttachments(prev => [...prev, result])
  }

  async function handleDelete(attachment: MovementAttachment) {
    const success = await deleteAttachment(attachment.id, attachment.file_url)
    if (success) setAttachments(prev => prev.filter(a => a.id !== attachment.id))
  }

  if (!movement) return null

  const typeConf = TYPE_CONFIG[movement.type]
  const statusConf = STATUS_CONFIG[movement.status]
  const items = movement.movement_items || []
  const totalCost = items.reduce((acc, item) => acc + (item.quantity * (item.unit_cost || 0)), 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-base">{movement.document_number}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeConf?.color}`}>
              {typeConf?.label}
            </span>
            <Badge className={statusConf?.color}>{statusConf?.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Almoxarifado</p>
            <p className="font-medium text-slate-900">{(movement.warehouse as any)?.name || "-"}</p>
          </div>
          {movement.warehouse_dest && (
            <div>
              <p className="text-slate-500 text-xs">Destino</p>
              <p className="font-medium text-slate-900">{(movement.warehouse_dest as any)?.name}</p>
            </div>
          )}
          {movement.project && (
            <div>
              <p className="text-slate-500 text-xs">Projeto</p>
              <p className="font-medium text-slate-900">{(movement.project as any)?.name}</p>
            </div>
          )}
          <div>
            <p className="text-slate-500 text-xs">Data</p>
            <p className="font-medium text-slate-900">
              {format(new Date(movement.occurred_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Solicitante</p>
            <p className="font-medium text-slate-900">
              {(movement.requested_by_profile as any)?.full_name || "-"}
            </p>
          </div>
          {movement.approved_by && (
            <div>
              <p className="text-slate-500 text-xs">Aprovado por</p>
              <p className="font-medium text-slate-900">
                {(movement.approved_by_profile as any)?.full_name || "-"}
              </p>
            </div>
          )}
        </div>

        {movement.notes && (
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Observacoes</p>
            <p className="text-sm text-slate-700">{movement.notes}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-slate-900 mb-2">Itens ({items.length})</p>
          <div className="space-y-1">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm text-slate-900">{(item.product as any)?.name}</p>
                  {(item.product as any)?.sku && (
                    <p className="text-xs text-slate-400">{(item.product as any).sku}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {item.quantity} {(item.product as any)?.unit}
                  </p>
                  {item.unit_cost && (
                    <p className="text-xs text-slate-400">
                      {(item.quantity * item.unit_cost).toLocaleString("pt-BR",
                        { style: "currency", currency: "BRL" })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {totalCost > 0 && (
            <div className="flex justify-between pt-2 border-t border-slate-200 mt-1">
              <span className="text-sm font-medium text-slate-700">Total</span>
              <span className="text-sm font-bold text-slate-900">
                {totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-900">
              Anexos ({attachments.length})
            </p>
            <Button variant="outline" size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}>
              <Upload size={14} className="mr-1" />
              {uploading ? "Enviando..." : "Anexar"}
            </Button>
            <input ref={fileRef} type="file" className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
                e.target.value = ""
              }} />
          </div>

          {attachments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">
              Nenhum anexo. Clique em Anexar para adicionar documentos.
            </p>
          ) : (
            <div className="space-y-2">
              {attachments.map(att => (
                <div key={att.id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={16} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700 truncate">{att.file_name}</span>
                    {att.file_size && (
                      <span className="text-xs text-slate-400 shrink-0">
                        {(att.file_size / 1024).toFixed(0)}KB
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={att.file_url} target="_blank" rel="noopener noreferrer">
                        <Download size={14} />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(att)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
