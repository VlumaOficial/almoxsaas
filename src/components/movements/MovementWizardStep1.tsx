import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList
} from '@/components/ui/command'
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ChevronsUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Warehouse } from '@/hooks/useWarehouses'
import { Project } from '@/hooks/useProjects'
import { MovementType } from '@/hooks/useMovements'

const TYPE_OPTIONS = [
  { value: 'entrada',       label: 'Entrada',       desc: 'Recebimento de materiais no almoxarifado' },
  { value: 'saida',         label: 'Saída',         desc: 'Retirada de materiais do almoxarifado' },
  { value: 'transferencia', label: 'Transferência', desc: 'Transferência entre almoxarifados' },
  { value: 'ajuste',        label: 'Ajuste',        desc: 'Ajuste manual de quantidade no estoque' },
  { value: 'inventario',    label: 'Inventário',    desc: 'Contagem e atualização do estoque' },
]

const PROJECT_REQUIRED_TYPES = ['saida', 'transferencia', 'retorno']

interface Step1Props {
  form: UseFormReturn<any>
  warehouses: Warehouse[]
  projects: Project[]
}

export function MovementWizardStep1({ form, warehouses, projects }: Step1Props) {
  const [projectOpen, setProjectOpen] = useState(false)
  const [warehouseOpen, setWarehouseOpen] = useState(false)
  const [warehouseDestOpen, setWarehouseDestOpen] = useState(false)

  const { watch, setValue, register, formState: { errors } } = form
  const type = watch('type') as MovementType
  const projectRequired = PROJECT_REQUIRED_TYPES.includes(type)
  const isTransfer = type === 'transferencia'

  const selectedProject = projects.find(p => p.id === watch('project_id'))
  const selectedWarehouse = warehouses.find(w => w.id === watch('warehouse_id'))
  const selectedWarehouseDest = warehouses.find(w => w.id === watch('warehouse_dest_id'))

  return (
    <div className="space-y-5">

      <div className="space-y-2">
        <Label>Tipo de movimentação *</Label>
        <div className="grid grid-cols-1 gap-2">
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue('type', opt.value)}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border text-left transition-colors',
                watch('type') === opt.value
                  ? 'border-blue-800 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <div className={cn(
                'w-4 h-4 rounded-full border-2 mt-0.5 shrink-0',
                watch('type') === opt.value
                  ? 'border-blue-800 bg-blue-800'
                  : 'border-slate-300'
              )} />
              <div>
                <p className={cn(
                  'text-sm font-medium',
                  watch('type') === opt.value ? 'text-blue-800' : 'text-slate-900'
                )}>{opt.label}</p>
                <p className="text-xs text-slate-500">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
        {errors.type && <p className="text-red-500 text-xs">Selecione o tipo</p>}
      </div>

      <div className="space-y-1.5">
        <Label>
          Projeto {projectRequired
            ? <span className="text-red-500">*</span>
            : <span className="text-slate-400">(opcional)</span>}
        </Label>
        <Popover open={projectOpen} onOpenChange={setProjectOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox"
              className={cn('w-full justify-between font-normal',
                errors.project_id ? 'border-red-500' : '')}>
              {selectedProject?.name || 'Selecione um projeto'}
              <ChevronsUpDown size={14} className="ml-2 text-slate-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar projeto..." />
              <CommandList>
                <CommandEmpty>Nenhum projeto encontrado</CommandEmpty>
                <CommandGroup>
                  {!projectRequired && (
                    <CommandItem value="none"
                      onSelect={() => { setValue('project_id', null); setProjectOpen(false) }}>
                      <Check size={14} className={cn('mr-2',
                        !watch('project_id') ? 'opacity-100' : 'opacity-0')} />
                      Sem projeto
                    </CommandItem>
                  )}
                  {projects.filter(p => p.status === 'em_andamento').map(p => (
                    <CommandItem key={p.id} value={p.name}
                      onSelect={() => { setValue('project_id', p.id); setProjectOpen(false) }}>
                      <Check size={14} className={cn('mr-2',
                        watch('project_id') === p.id ? 'opacity-100' : 'opacity-0')} />
                      {p.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.project_id && <p className="text-red-500 text-xs">Projeto obrigatório para este tipo</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Almoxarifado {isTransfer ? 'de origem' : ''} *</Label>
        <Popover open={warehouseOpen} onOpenChange={setWarehouseOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox"
              className={cn('w-full justify-between font-normal',
                errors.warehouse_id ? 'border-red-500' : '')}>
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
                        watch('warehouse_id') === w.id ? 'opacity-100' : 'opacity-0')} />
                      {w.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.warehouse_id && <p className="text-red-500 text-xs">Almoxarifado obrigatório</p>}
      </div>

      {isTransfer && (
        <div className="space-y-1.5">
          <Label>Almoxarifado de destino *</Label>
          <Popover open={warehouseDestOpen} onOpenChange={setWarehouseDestOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox"
                className={cn('w-full justify-between font-normal',
                  errors.warehouse_dest_id ? 'border-red-500' : '')}>
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
                      .filter(w => w.is_active && w.id !== watch('warehouse_id'))
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
          {errors.warehouse_dest_id && <p className="text-red-500 text-xs">Almoxarifado de destino obrigatório</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="occurred_at">Data e hora *</Label>
        <Input id="occurred_at" type="datetime-local"
          {...register('occurred_at')}
          className={errors.occurred_at ? 'border-red-500' : ''} />
        {errors.occurred_at && <p className="text-red-500 text-xs">Data obrigatória</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações <span className="text-slate-400">(opcional)</span></Label>
        <Textarea id="notes" placeholder="Informações adicionais..."
          rows={2} {...register('notes')} />
      </div>
    </div>
  )
}
