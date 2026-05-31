import { useState } from 'react'
import { Movement } from '@/hooks/useMovements'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList
} from '@/components/ui/command'
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover'
import { AlertTriangle, ChevronsUpDown, Plus, Trash2 } from 'lucide-react'

interface ReturnItem {
  product_id: string
  product_name: string
  product_unit: string
  max_quantity: number
  quantity: number
}

interface ReturnModalProps {
  open: boolean
  onClose: () => void
  movement: Movement | null
  onConfirm: (items: { product_id: string; quantity: number }[]) => Promise<boolean>
}

export function ReturnModal({ open, onClose, movement, onConfirm }: ReturnModalProps) {
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([])
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!movement) return null

  const movementItems = movement.movement_items || []
  const addedIds = new Set(returnItems.map(i => i.product_id))
  const availableItems = movementItems.filter(i => !addedIds.has(i.product_id))

  function addItem(item: any) {
    setReturnItems(prev => [...prev, {
      product_id: item.product_id,
      product_name: (item.product as any)?.name || item.product_id,
      product_unit: (item.product as any)?.unit || 'un',
      max_quantity: item.quantity,
      quantity: 0,
    }])
    setPopoverOpen(false)
  }

  function removeItem(productId: string) {
    setReturnItems(prev => prev.filter(i => i.product_id !== productId))
  }

  function updateQuantity(productId: string, value: string) {
    const num = parseFloat(value)
    setReturnItems(prev => prev.map(i =>
      i.product_id === productId
        ? { ...i, quantity: isNaN(num) ? 0 : num }
        : i
    ))
  }

  function handleClose() {
    setReturnItems([])
    onClose()
  }

  async function handleConfirm() {
    const validItems = returnItems.filter(i => i.quantity > 0 && i.quantity <= i.max_quantity)
    if (validItems.length === 0) return

    setSubmitting(true)
    const success = await onConfirm(
      validItems.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
    )
    if (success) {
      setReturnItems([])
      onClose()
    }
    setSubmitting(false)
  }

  const hasValidItems = returnItems.some(i => i.quantity > 0 && i.quantity <= i.max_quantity)

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

          {/* Seletor de produto */}
          {availableItems.length > 0 && (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  <span className="flex items-center gap-2">
                    <Plus size={14} className="text-blue-700" />
                    Adicionar produto para retorno
                  </span>
                  <ChevronsUpDown size={14} className="text-slate-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar produto..." />
                  <CommandList>
                    <CommandEmpty>Nenhum produto disponível</CommandEmpty>
                    <CommandGroup>
                      {availableItems.map(item => (
                        <CommandItem
                          key={item.product_id}
                          value={(item.product as any)?.name || item.product_id}
                          onSelect={() => addItem(item)}
                        >
                          <div className="flex-1">
                            <p className="text-sm">{(item.product as any)?.name}</p>
                            <p className="text-xs text-slate-400">
                              Máx: {item.quantity} {(item.product as any)?.unit}
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          {/* Lista de itens adicionados */}
          {returnItems.length === 0 ? (
            <div className="py-6 text-center border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-slate-400 text-sm">Nenhum produto selecionado</p>
              <p className="text-slate-300 text-xs mt-1">
                Clique acima para adicionar produtos ao retorno
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {returnItems.map(item => {
                const isInvalid = item.quantity > item.max_quantity
                return (
                  <div key={item.product_id}
                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        Máx: {item.max_quantity} {item.product_unit}
                      </p>
                    </div>
                    <div className="w-28 shrink-0">
                      <Input
                        type="number"
                        min="0"
                        max={item.max_quantity}
                        step="0.01"
                        placeholder="Qtd"
                        value={item.quantity || ''}
                        onChange={e => updateQuantity(item.product_id, e.target.value)}
                        className={isInvalid ? 'border-red-500' : ''}
                        autoFocus
                      />
                      {isInvalid && (
                        <p className="text-xs text-red-500 mt-0.5">
                          Máx: {item.max_quantity}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm"
                      className="text-red-500 hover:text-red-700 shrink-0"
                      onClick={() => removeItem(item.product_id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
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
