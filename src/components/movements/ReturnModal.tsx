import { useState } from 'react'
import { Movement } from '@/hooks/useMovements'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle } from 'lucide-react'

interface ReturnModalProps {
  open: boolean
  onClose: () => void
  movement: Movement | null
  onConfirm: (items: { product_id: string; quantity: number }[]) => Promise<boolean>
}

export function ReturnModal({ open, onClose, movement, onConfirm }: ReturnModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)

  if (!movement) return null

  const items = movement.movement_items || []

  function handleQuantityChange(productId: string, value: string) {
    const num = parseFloat(value)
    setQuantities(prev => ({ ...prev, [productId]: isNaN(num) ? 0 : num }))
  }

  async function handleConfirm() {
    const returnItems = items
      .filter(item => (quantities[item.product_id] || 0) > 0)
      .map(item => ({
        product_id: item.product_id,
        quantity: quantities[item.product_id],
      }))

    if (returnItems.length === 0) return

    setSubmitting(true)
    const success = await onConfirm(returnItems)
    if (success) {
      setQuantities({})
      onClose()
    }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Retorno</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Origem: {movement.document_number}</p>
              <p className="text-xs mt-0.5">
                Informe as quantidades que estao retornando ao almoxarifado.
                Nao e necessario retornar todos os itens.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {items.map(item => {
              const maxQty = item.quantity
              const returnQty = quantities[item.product_id] || 0
              const isInvalid = returnQty > maxQty

              return (
                <div key={item.product_id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">
                      {(item.product as any)?.name || item.product_id}
                    </Label>
                    <span className="text-xs text-slate-400">
                      Max: {maxQty} {(item.product as any)?.unit}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max={maxQty}
                    step="0.01"
                    placeholder="0"
                    value={quantities[item.product_id] || ""}
                    onChange={e => handleQuantityChange(item.product_id, e.target.value)}
                    className={isInvalid ? "border-red-500" : ""}
                  />
                  {isInvalid && (
                    <p className="text-xs text-red-500">
                      Quantidade maxima: {maxQty} {(item.product as any)?.unit}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            className="bg-blue-800 hover:bg-blue-900"
            onClick={handleConfirm}
            disabled={submitting || Object.values(quantities).every(q => q === 0)}
          >
            {submitting ? "Registrando..." : "Confirmar retorno"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
