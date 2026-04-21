import { useState } from 'react'
import { Product } from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Pencil, Trash2, Package } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/contexts/AuthContext'

interface ProductTableProps {
  products: Product[]
  loading: boolean
  onEdit: (product: Product) => void
  onDelete: (id: string) => Promise<boolean>
  onToggleStatus: (id: string, is_active: boolean) => Promise<boolean>
}

export function ProductTable({ products, loading, onEdit, onDelete, onToggleStatus }: ProductTableProps) {
  const { profile } = useAuth()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const canEdit = profile?.role && ['super_admin', 'owner', 'manager'].includes(profile.role)
  const canViewCost = profile?.role && ['super_admin', 'owner', 'manager'].includes(profile.role)

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatCurrency(value: number | null) {
    if (value === null) return <span className="text-slate-300">—</span>
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

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
        {[1,2,3,4].map(i => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhum produto encontrado</p>
            <p className="text-slate-400 text-sm mt-1">Tente ajustar os filtros ou cadastre um novo produto</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Produto</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">SKU</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Categoria</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Unidade</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Est. Mínimo</th>
                  {canViewCost && <th className="text-right px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Preço de custo</th>}
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Cadastrado por</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Data</th>
                  {canEdit && <th className="text-center px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Ativo</th>}
                  {canEdit && <th className="text-right px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-slate-400 truncate max-w-xs">{product.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {product.sku || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {product.category?.name || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="outline">{product.unit}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-600">
                      {product.min_stock} {product.unit}
                    </td>
                    {canViewCost && (
                      <td className="px-5 py-3 text-right text-slate-600">
                        {formatCurrency(product.cost_price)}
                      </td>
                    )}
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {product.creator?.full_name || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {formatDate(product.created_at)}
                    </td>
                    {canEdit && (
                      <td className="px-5 py-3 text-center">
                        <Switch
                          checked={product.is_active}
                          onCheckedChange={(val) => onToggleStatus(product.id, val)}
                        />
                      </td>
                    )}
                    {canEdit && (
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteId(product.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    )}
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
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido permanentemente.
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
