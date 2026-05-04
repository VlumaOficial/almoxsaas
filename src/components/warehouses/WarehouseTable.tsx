import { useState } from 'react'
import { Warehouse } from '@/hooks/useWarehouses'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Pencil, Trash2, Warehouse as WarehouseIcon, MapPin, User } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface WarehouseTableProps {
  warehouses: Warehouse[]
  loading: boolean
  onEdit: (warehouse: Warehouse) => void
  onDelete: (id: string) => Promise<boolean>
  onToggleStatus: (id: string, is_active: boolean) => Promise<boolean>
}

export function WarehouseTable({
  warehouses, loading, onEdit, onDelete, onToggleStatus
}: WarehouseTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await onDelete(deleteId)
    setDeleting(false)
    setDeleteId(null)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />)}
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {warehouses.length === 0 ? (
          <div className="p-12 text-center">
            <WarehouseIcon size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhum almoxarifado cadastrado</p>
            <p className="text-slate-400 text-sm mt-1">
              Crie um almoxarifado para começar a registrar movimentações
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Almoxarifado</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Responsável</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Localização</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Cadastrado em</th>
                  <th className="text-center px-5 py-3 font-medium text-slate-500">Ativo</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map(warehouse => (
                  <tr key={warehouse.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{warehouse.name}</p>
                      {warehouse.description && (
                        <p className="text-xs text-slate-400 truncate max-w-xs">
                          {warehouse.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {warehouse.responsible ? (
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <User size={13} className="text-slate-400" />
                          {(warehouse.responsible as any).full_name}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {warehouse.city ? (
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <MapPin size={13} className="text-slate-400" />
                          {[warehouse.city, warehouse.state].filter(Boolean).join(', ')}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                      {format(new Date(warehouse.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Switch
                        checked={warehouse.is_active}
                        onCheckedChange={(val) => onToggleStatus(warehouse.id, val)}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(warehouse)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(warehouse.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir almoxarifado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O almoxarifado será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
