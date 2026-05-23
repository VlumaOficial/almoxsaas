import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Project, ProjectFormData, ProjectStatus } from '@/hooks/useProjects'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList
} from '@/components/ui/command'
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover'
import { ChevronsUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'planejamento', label: 'Planejamento' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'pausado',      label: 'Pausado' },
  { value: 'concluido',    label: 'Concluído' },
  { value: 'cancelado',    label: 'Cancelado' },
]

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().nullable().optional(),
  responsible_id: z.string().nullable().optional(),
  status: z.enum(['planejamento', 'em_andamento', 'pausado', 'concluido', 'cancelado']),
  started_at: z.string().nullable().optional(),
  ended_at: z.string().nullable().optional(),
})

type FormData = z.infer<typeof schema>

interface ProjectDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ProjectFormData) => Promise<boolean>
  project?: Project | null
  profiles: { id: string; full_name: string }[]
}

export function ProjectDrawer({
  open, onClose, onSubmit, project, profiles
}: ProjectDrawerProps) {
  const isEditing = !!project
  const [responsibleOpen, setResponsibleOpen] = useState(false)

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'planejamento' },
  })

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description,
        responsible_id: project.responsible_id,
        status: project.status,
        started_at: project.started_at?.split('T')[0] || null,
        ended_at: project.ended_at?.split('T')[0] || null,
      })
    } else {
      reset({
        name: '', description: null, responsible_id: null,
        status: 'planejamento', started_at: null, ended_at: null,
      })
    }
  }, [project, open])

  async function onFormSubmit(data: FormData) {
    const success = await onSubmit({
      ...data,
      responsible_id: data.responsible_id || null,
      started_at: data.started_at || null,
      ended_at: data.ended_at || null,
    })
    if (success) onClose()
  }

  const selectedResponsible = profiles.find(p => p.id === watch('responsible_id'))

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Editar projeto' : 'Novo projeto'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 py-6">

          <div className="space-y-1.5">
            <Label htmlFor="name">Nome do projeto *</Label>
            <Input id="name" placeholder="Ex: Obra Lauro de Freitas"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição <span className="text-slate-400">(opcional)</span></Label>
            <Textarea id="description" placeholder="Detalhes do projeto..."
              rows={3} {...register('description')} />
          </div>

          <div className="space-y-1.5">
            <Label>Status *</Label>
            <Select
              value={watch('status')}
              onValueChange={(val) => setValue('status', val as ProjectStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Responsável <span className="text-slate-400">(opcional)</span></Label>
            <Popover open={responsibleOpen} onOpenChange={setResponsibleOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox"
                  className="w-full justify-between font-normal">
                  {selectedResponsible?.full_name || 'Selecione um responsável'}
                  <ChevronsUpDown size={14} className="ml-2 text-slate-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar usuário..." />
                  <CommandList>
                    <CommandEmpty>Nenhum usuário encontrado</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="none"
                        onSelect={() => {
                          setValue('responsible_id', null)
                          setResponsibleOpen(false)
                        }}>
                        <Check size={14} className={cn('mr-2',
                          !watch('responsible_id') ? 'opacity-100' : 'opacity-0')} />
                        Sem responsável
                      </CommandItem>
                      {profiles.map(p => (
                        <CommandItem key={p.id} value={p.full_name}
                          onSelect={() => {
                            setValue('responsible_id', p.id)
                            setResponsibleOpen(false)
                          }}>
                          <Check size={14} className={cn('mr-2',
                            watch('responsible_id') === p.id ? 'opacity-100' : 'opacity-0')} />
                          {p.full_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="started_at">Data de início <span className="text-slate-400">(opcional)</span></Label>
              <Input id="started_at" type="date" {...register('started_at')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ended_at">Data de encerramento <span className="text-slate-400">(opcional)</span></Label>
              <Input id="ended_at" type="date" {...register('ended_at')} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-blue-800 hover:bg-blue-900"
              disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar projeto'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
