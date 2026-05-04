import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Warehouse, WarehouseFormData } from '@/hooks/useWarehouses'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList
} from '@/components/ui/command'
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover'
import { ChevronsUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
  responsible_id: z.string().nullable().optional(),
  street: z.string().nullable().optional(),
  number: z.string().nullable().optional(),
  complement: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zipcode: z.string().nullable().optional(),
})

type FormData = z.infer<typeof schema>

interface WarehouseDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: WarehouseFormData) => Promise<boolean>
  warehouse?: Warehouse | null
  profiles: { id: string; full_name: string }[]
}

export function WarehouseDrawer({
  open, onClose, onSubmit, warehouse, profiles
}: WarehouseDrawerProps) {
  const isEditing = !!warehouse
  const [responsibleOpen, setResponsibleOpen] = useState(false)

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
  })

  useEffect(() => {
    if (warehouse) {
      reset({
        name: warehouse.name,
        description: warehouse.description,
        is_active: warehouse.is_active,
        responsible_id: warehouse.responsible_id,
        street: warehouse.street,
        number: warehouse.number,
        complement: warehouse.complement,
        district: warehouse.district,
        city: warehouse.city,
        state: warehouse.state,
        zipcode: warehouse.zipcode,
      })
    } else {
      reset({
        name: '', description: null, is_active: true,
        responsible_id: null, street: null, number: null,
        complement: null, district: null, city: null,
        state: null, zipcode: null,
      })
    }
  }, [warehouse, open])

  async function onFormSubmit(data: FormData) {
    const success = await onSubmit({
      ...data,
      responsible_id: data.responsible_id || null,
    })
    if (success) onClose()
  }

  const selectedResponsible = profiles.find(p => p.id === watch('responsible_id'))

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? 'Editar almoxarifado' : 'Novo almoxarifado'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 py-6">

          <div className="space-y-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" placeholder="Ex: Almoxarifado Central"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição <span className="text-slate-400">(opcional)</span></Label>
            <Textarea id="description" placeholder="Detalhes do almoxarifado..."
              rows={2} {...register('description')} />
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

          <Separator />

          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">
              Endereço <span className="text-slate-400 font-normal">(opcional)</span>
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="zipcode">CEP</Label>
                  <Input id="zipcode" placeholder="00000-000" {...register('zipcode')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" placeholder="BA" maxLength={2} {...register('state')} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="Salvador" {...register('city')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="district">Bairro</Label>
                <Input id="district" placeholder="Centro" {...register('district')} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="street">Rua</Label>
                  <Input id="street" placeholder="Rua das Flores" {...register('street')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="number">Número</Label>
                  <Input id="number" placeholder="123" {...register('number')} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="complement">Complemento</Label>
                <Input id="complement" placeholder="Galpão A, Setor 2" {...register('complement')} />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">Almoxarifado ativo</p>
              <p className="text-xs text-slate-500">
                Almoxarifados inativos não aparecem nas movimentações
              </p>
            </div>
            <Switch
              checked={watch('is_active')}
              onCheckedChange={(val) => setValue('is_active', val)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-blue-800 hover:bg-blue-900"
              disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar almoxarifado'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
