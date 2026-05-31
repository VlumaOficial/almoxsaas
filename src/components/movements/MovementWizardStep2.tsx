import { useState, useEffect } from 'react'
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
import { Warehouse } from '@/hooks/useWarehouses'
import { Project } from '@/hooks/useProjects'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface Step2Props {
  form: UseFormReturn<any>
  products: Product[]
  stockMap: Record<string, number>
  warehouses: Warehouse[]
  projects: Project[]
}

export function MovementWizardStep2({ form, products, stockMap, warehouses, projects }: Step2Props) {
  const { company } = useAuth()
  const { watch, setValue } = form
  const items = watch('items') || []
  const type = watch('type')
  const transferSubtype = watch('transfer_subtype')
  const warehouseId = watch('warehouse_id')

  const [productOpen, setProductOpen] = useState(false)
  const [warehouseOpen, setWarehouseOpen] = useState(false)
  const [warehouseDestOpen, setWarehouseDestOpen] = useState(false)
  const [projectDestOpen, setProjectDestOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [warehouseStockMap, setWarehouseStockMap] = useState<Record<string, number>>({})

  const isTransfer = type === 'transferencia'
  const isTransferBetweenWarehouses = isTransfer && transferSubtype === 'almoxarifado'
  const isTransferBetweenProjects = isTransfer && transferSubtype === 'projeto'

  const selectedWarehouse = warehouses.find(w => w.id === warehouseId)
  const selectedWarehouseDest = warehouses.find(w => w.id === watch('warehouse_dest_id'))
  const selectedProjectDest = projects.find(p => p.id === watch('project_dest_id'))

  // Carrega estoque do almoxarifado selecionado
  useEffect(() => {
    if (!warehouseId || !company?.id) return
    supabase
      .from('stock')
      .select('product_id, quantity')
      .eq('warehouse_id', warehouseId)
      .eq('company_id', company.id)
      .then(({ data }) => {
        const map: Record<string, number> = {}
        ;(data || []).forEach((s: any) => { map[s.product_id] = s.quantity })
        setWarehouseStockMap(map)
        setValue('items', []) // limpa itens ao mudar almoxarifado
      })
  }, [warehouseId, company?.id])

  // Filtra produtos com estoque no almoxarifado para saidas e transferencias
  const availableProducts = products.filter(p => {
    if (!p.is_active) return false
    if (['saida', 'transferencia'].includes(type)) {
      return (warehouseStockMap[p.id] || 0) > 0
    }
    return true
  })

  const addedProductIds = new Set(items.map((i: any) => i.product_id))

  function addItem() {
    if (!selectedProductId || !quantity || Number(quantity) <= 0) return
    const product = products.find(p => p.id === selectedProductId)
    if (!product) return
    const currentStock = warehouseStockMap[selectedProductId] || 0
    if (['saida', 'transferencia'].includes(type) && Number(quantity) > currentStock) return

    const newItem = {
      product_id: selectedProductId,
      quantity: Number(quantity),
      unit_cost: product.cost_price || null,
      notes: null,
      product: { name: product.name, unit: product.unit, sku: product.sku },
      current_stock: currentStock,
    }
    setValue('items', [...items, newItem])
    setSelectedProductId('')
    setQuantity('')
    setProductOpen(false)
  }

  function removeItem(index: number) {
    setValue('items', items.filter((_: any, i: number) => i !== index))
  }

  return (
    <div className="space-y-5">

      {/* Almoxarifado origem */}
      <div className="space-y-1.5">
        <Label>{isTransferBetweenWarehouses ? 'Almoxarifado de origem *' : 'Almoxarifado *'}</Label>
        <Popover open={warehouseOpen} onOpenChange={setWarehouseOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox"
              className="w-full justify-between font-normal">
              {selectedWarehouse?.name || 'Selecione um almoxarifado'}
              <ChevronsUpDown size={14} className="ml-2 text-slate-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar almoxarifado..." />
              <CommandList>
                <CommandEmpty>Nenhum almoxarifado encontrado</CommandEmpty>
                <CommandGroup>
                  {warehouses.filter(w => w.is_active).map(w => (
                    <CommandItem key={w.id} value={w.name}
                      onSelect={() => { setValue('warehouse_id', w.id); setWarehouseOpen(false) }}>
                      <Check size={14} className={cn('mr-2',
                        warehouseId === w.id ? 'opacity-100' : 'opacity-0')} />
                      {w.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Almoxarifado destino (transferencia entre almoxarifados) */}
      {isTransferBetweenWarehouses && (
        <div className="space-y-1.5">
          <Label>Almoxarifado de destino *</Label>
          <Popover open={warehouseDestOpen} onOpenChange={setWarehouseDestOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox"
                className="w-full justify-between font-normal">
                {selectedWarehouseDest?.name || 'Selecione o destino'}
                <ChevronsUpDown size={14} className="ml-2 text-slate-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar almoxarifado..." />
                <CommandList>
                  <CommandEmpty>Nenhum almoxarifado encontrado</CommandEmpty>
                  <CommandGroup>
                    {warehouses
                      .filter(w => w.is_active && w.id !== warehouseId)
                      .map(w => (
                        <CommandItem key={w.id} value={w.name}
                          onSelect={() => { setValue('warehouse_dest_id', w.id); setWarehouseDestOpen(false) }}>
                          <Check size={14} className={cn('mr-2',
                            watch('warehouse_dest_id') === w.id ? 'opacity-100' : 'opacity-0')} />
                          {w.name}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Projeto destino (transferencia entre projetos) */}
      {isTransferBetweenProjects && (
        <div className="space-y-1.5">
          <Label>Projeto de destino *</Label>
          <Popover open={projectDestOpen} onOpenChange={setProjectDestOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox"
                className="w-full justify-between font-normal">
                {selectedProjectDest?.name || 'Selecione o projeto destino'}
                <ChevronsUpDown size={14} className="ml-2 text-slate-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar projeto..." />
                <CommandList>
                  <CommandEmpty>Nenhum projeto encontrado</CommandEmpty>
                  <CommandGroup>
                    {projects
                      .filter(p => p.status === 'em_andamento' && p.id !== watch('project_id'))
                      .map(p => (
                        <CommandItem key={p.id} value={p.name}
                          onSelect={() => { setValue('project_dest_id', p.id); setProjectDestOpen(false) }}>
                          <Check size={14} className={cn('mr-2',
                            watch('project_dest_id') === p.id ? 'opacity-100' : 'opacity-0')} />
                          {p.name}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Seletor de produto — só aparece após escolher almoxarifado */}
      {warehouseId ? (
        <>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label>Produto</Label>
              <Popover open={productOpen} onOpenChange={setProductOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox"
                    className="w-full justify-between font-normal">
                    {selectedProductId
                      ? products.find(p => p.id === selectedProductId)?.name
                      : 'Selecione um produto'}
                    <ChevronsUpDown size={14} className="ml-2 text-slate-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar produto..." />
                    <CommandList>
                      <CommandEmpty>
                        {['saida', 'transferencia'].includes(type)
                          ? 'Nenhum produto com estoque neste almoxarifado'
                          : 'Nenhum produto encontrado'}
                      </CommandEmpty>
                      <CommandGroup>
                        {availableProducts
                          .filter(p => !addedProductIds.has(p.id))
                          .map(p => (
                            <CommandItem key={p.id} value={`${p.name} ${p.sku || ''}`}
                              onSelect={() => {
                                setSelectedProductId(p.id)
                                setProductOpen(false)
                              }}>
                              <Check size={14} className={cn('mr-2',
                                selectedProductId === p.id ? 'opacity-100' : 'opacity-0')} />
                              <div className="flex-1">
                                <p className="text-sm">{p.name}</p>
                                <p className="text-xs text-slate-400">
                                  {p.sku && `${p.sku} - `}
                                  Estoque: {warehouseStockMap[p.id] || 0} {p.unit}
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
                {items.length} item{items.length !== 1 ? 's' : ''} adicionado{items.length !== 1 ? 's' : ''}
              </p>
              {items.map((item: any, index: number) => {
                const currentStock = warehouseStockMap[item.product_id] || 0
                const insufficientStock = ['saida', 'transferencia'].includes(type) &&
                  item.quantity > currentStock
                return (
                  <div key={index}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      insufficientStock ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'
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
                          Estoque: {currentStock} {item.product?.unit}
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
        </>
      ) : (
        <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-400 text-sm">Selecione um almoxarifado primeiro</p>
          <p className="text-slate-300 text-xs mt-1">Os produtos disponiveis aparecerão aqui</p>
        </div>
      )}
    </div>
  )
}
