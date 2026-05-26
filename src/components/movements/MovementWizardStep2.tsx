import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList
} from '@/components/ui/command'
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover'
import { ChevronsUpDown, Check, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product } from '@/hooks/useProducts'

interface Step2Props {
  form: UseFormReturn<any>
  products: Product[]
  stockMap: Record<string, number>
}

export function MovementWizardStep2({ form, products, stockMap }: Step2Props) {
  const { watch, setValue } = form
  const items = watch('items') || []
  const type = watch('type')
  const [productOpen, setProductOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState('')

  const activeProducts = products.filter(p => p.is_active)
  const addedProductIds = new Set(items.map((i: any) => i.product_id))

  function addItem() {
    if (!selectedProductId || !quantity || Number(quantity) <= 0) return
    const product = products.find(p => p.id === selectedProductId)
    if (!product) return
    const currentStock = stockMap[selectedProductId] || 0
    if (["saida", "transferencia"].includes(type) && Number(quantity) > currentStock) return
    const newItem = {
      product_id: selectedProductId,
      quantity: Number(quantity),
      unit_cost: product.cost_price || null,
      notes: null,
      product: { name: product.name, unit: product.unit, sku: product.sku },
      current_stock: currentStock,
    }
    setValue("items", [...items, newItem])
    setSelectedProductId("")
    setQuantity("")
    setProductOpen(false)
  }

  function removeItem(index: number) {
    const newItems = items.filter((_: any, i: number) => i !== index)
    setValue("items", newItems)
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-medium text-slate-900 mb-1">Adicionar produtos</h3>
        <p className="text-xs text-slate-500 mb-4">
          Selecione os produtos e quantidades para esta movimentacao
        </p>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1 space-y-1.5">
          <Label>Produto</Label>
          <Popover open={productOpen} onOpenChange={setProductOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox"
                className="w-full justify-between font-normal">
                {selectedProductId
                  ? products.find(p => p.id === selectedProductId)?.name
                  : "Selecione um produto"}
                <ChevronsUpDown size={14} className="ml-2 text-slate-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar produto..." />
                <CommandList>
                  <CommandEmpty>Nenhum produto encontrado</CommandEmpty>
                  <CommandGroup>
                    {activeProducts
                      .filter(p => !addedProductIds.has(p.id))
                      .map(p => (
                        <CommandItem key={p.id} value={p.name}
                          onSelect={() => {
                            setSelectedProductId(p.id)
                            setProductOpen(false)
                          }}>
                          <Check size={14} className={cn("mr-2",
                            selectedProductId === p.id ? "opacity-100" : "opacity-0")} />
                          <div className="flex-1">
                            <p className="text-sm">{p.name}</p>
                            <p className="text-xs text-slate-400">
                              {p.sku && `${p.sku} - `}
                              Estoque: {stockMap[p.id] || 0} {p.unit}
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-28 space-y-1.5">
          <Label>Quantidade</Label>
          <Input
            type="number" min="0.01" step="0.01"
            placeholder="0"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />
        </div>

        <Button type="button" onClick={addItem}
          disabled={!selectedProductId || !quantity}
          className="bg-blue-800 hover:bg-blue-900 shrink-0">
          <Plus size={16} />
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {items.length} item{items.length !== 1 ? "s" : ""} adicionado{items.length !== 1 ? "s" : ""}
          </p>
          {items.map((item: any, index: number) => {
            const currentStock = stockMap[item.product_id] || 0
            const insufficientStock = ["saida", "transferencia"].includes(type) &&
              item.quantity > currentStock
            return (
              <div key={index}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  insufficientStock ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"
                )}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {item.product?.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs">
                      {item.quantity} {item.product?.unit}
                    </Badge>
                    {item.product?.sku && (
                      <span className="text-xs text-slate-400">{item.product.sku}</span>
                    )}
                    <span className="text-xs text-slate-400">
                      Estoque atual: {currentStock} {item.product?.unit}
                    </span>
                  </div>
                  {insufficientStock && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertTriangle size={11} />
                      Estoque insuficiente
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                  onClick={() => removeItem(index)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-400 text-sm">Nenhum produto adicionado ainda</p>
          <p className="text-slate-300 text-xs mt-1">Selecione um produto acima para comecar</p>
        </div>
      )}
    </div>
  )
}
