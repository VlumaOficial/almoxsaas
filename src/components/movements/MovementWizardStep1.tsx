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
import { useState } from 'react'
import { Project } from '@/hooks/useProjects'
import { MovementType } from '@/hooks/useMovements'

const TYPE_OPTIONS = [
  { value: 'entrada',       label: 'Entrada',       desc: 'Recebimento de materiais no almoxarifado' },
  { value: 'saida',         label: 'Saida',         desc: 'Retirada de materiais do almoxarifado' },
  { value: 'transferencia', label: 'Transferencia', desc: 'Transferencia entre almoxarifados ou projetos' },
  { value: 'ajuste',        label: 'Ajuste',        desc: 'Ajuste manual de quantidade no estoque' },
  { value: 'inventario',    label: 'Inventario',    desc: 'Contagem e atualizacao do estoque' },
]

const PROJECT_REQUIRED_TYPES = ['saida', 'transferencia', 'retorno']

interface Step1Props {
  form: UseFormReturn<any>
  projects: Project[]
}

export function MovementWizardStep1({ form, projects }: Step1Props) {
  const [projectOpen, setProjectOpen] = useState(false)
  const { watch, setValue, register, formState: { errors } } = form
  const type = watch('type') as MovementType
  const projectRequired = PROJECT_REQUIRED_TYPES.includes(type)
  const isTransfer = type === 'transferencia'
  const selectedProject = projects.find(p => p.id === watch('project_id'))

  return (
    <div className="space-y-5">

      {/* Tipo de movimentacao */}
      <div className="space-y-2">
        <Label>Tipo de movimentacao *</Label>
        <div className="grid grid-cols-1 gap-2">
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setValue('type', opt.value)
                setValue('transfer_subtype', null)
              }}
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

      {/* Subtipo transferencia */}
      {isTransfer && (
        <div className="space-y-2">
          <Label>Tipo de transferencia *</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'almoxarifado', label: 'Entre almoxarifados', desc: 'Material muda fisicamente de local' },
              { value: 'projeto',      label: 'Entre projetos',      desc: 'Material muda de projeto no mesmo local' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('transfer_subtype', opt.value)}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border text-left transition-colors',
                  watch('transfer_subtype') === opt.value
                    ? 'border-blue-800 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 mt-0.5 shrink-0',
                  watch('transfer_subtype') === opt.value
                    ? 'border-blue-800 bg-blue-800'
                    : 'border-slate-300'
                )} />
                <div>
                  <p className={cn(
                    'text-sm font-medium',
                    watch('transfer_subtype') === opt.value ? 'text-blue-800' : 'text-slate-900'
                  )}>{opt.label}</p>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
          {errors.transfer_subtype && <p className="text-red-500 text-xs">Selecione o tipo de transferencia</p>}
        </div>
      )}

      {/* Projeto */}
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
        {errors.project_id && <p className="text-red-500 text-xs">Projeto obrigatorio para este tipo</p>}
      </div>

      {/* Data e hora */}
      <div className="space-y-1.5">
        <Label htmlFor="occurred_at">Data e hora *</Label>
        <Input id="occurred_at" type="datetime-local"
          {...register('occurred_at')}
          className={errors.occurred_at ? 'border-red-500' : ''} />
        {errors.occurred_at && <p className="text-red-500 text-xs">Data obrigatoria</p>}
      </div>

      {/* Observacoes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Observacoes <span className="text-slate-400">(opcional)</span></Label>
        <Textarea id="notes" placeholder="Informacoes adicionais..."
          rows={2} {...register('notes')} />
      </div>
    </div>
  )
}
