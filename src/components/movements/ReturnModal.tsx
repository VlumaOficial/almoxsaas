import { useState } from 'react'
import { Movement } from '@/hooks/useMovements'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle } from 'lucide-react'

interface ReturnModalProps {
  open: boolean
  onClose: () => void
  movement: Movement | null
  onConfirm: (items: { product_id: string; quantity: number }[]) => Promise<boolean>
}

export function ReturnModal({ open, onClose, movement, onConfirm }: ReturnModalProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)

  if (!movement) return null

  const items = movement.movement_items || []

  function toggleItem(productId: string) {
    setSelected(prev => {
      const next = { ...prev, [productId]: !prev[productId] }
      if (!next[productId]) {
        setQuantities(q => { const nq = { ...q }; delete nq[productId]; return nq })
      }
      return next
    })
  }

  function handleQuantityChange(productId: string, value: string) {
    const num = parseFloat(value)
    setQuantities(prev => ({ ...prev, [productId]: isNaN(num) ? 0 : num }))
  }

  function handleClose() {
    setSelected({})
    setQuantities({})
    onClose()
  }

  async function handleConfirm() {
    const returnItems = items
      .filter(item => selected[item.product_id] && (quantities[item.product_id] || 0) > 0)
      .map(item => ({
        product_id: item.product_id,
        quantity: quantities[item.product_id],
      }))

    if (returnItems.length === 0) return

    setSubmitting(true)
    const success = await onConfirm(returnItems)
    if (success) {
      setSelected({})
      setQuantities({})
      onClose()
    }
    setSubmitting(false)
  }

  const hasValidItems = items.some(item =>
    selected[item.product_id] && (quantities[item.product_id] || 0) > 0
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
                Selecione os produtos que estão retornando e informe a quantidade.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {items.map(item => {
              const maxQty = item.quantity
              const isSelected = !!selected[item.product_id]
              const returnQty = quantities[item.product_id] || 0
              const isInvalid = isSelected && returnQty > maxQty

              return (
                <div key={item.product_id}
                  className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={item.product_id}
                      checked={isSelected}
                      onCheckedChange={() => toggleItem(item.product_id)}
                    />
                    <label htmlFor={item.product_id}
                      className="flex-1 cursor-pointer">
                      <p className="text-sm font-medium text-slate-900">
                        {(item.product as any)?.name || item.product_id}
                      </p>
                      <p className="text-xs text-slate-400">
                        Máx: {maxQty} {(item.product as any)?.unit}
                      </p>
                    </label>
                  </div>

                  {isSelected && (
                    <div className="ml-7 space-y-1">
                      <Input
                        type="number"
                        min="0"
                        max={maxQty}
                        step="0.01"
                        placeholder={`Quantidade (máx: ${maxQty})`}
                        value={quantities[item.product_id] || ''}
                        onChange={e => handleQuantityChange(item.product_id, e.target.value)}
                        className={isInvalid ? 'border-red-500' : ''}
                        autoFocus
                      />
                      {isInvalid && (
                        <p className="text-xs text-red-500">
                          Quantidade máxima: {maxQty} {(item.product as any)?.unit}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button
            className="bg-blue-800 hover:bg-blue-900"
            onClick={handleConfirm}
            disabled={submitting || !hasValidItems}
          >
            {submitting ? 'Registrando...' : 'Confirmar retorno'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
