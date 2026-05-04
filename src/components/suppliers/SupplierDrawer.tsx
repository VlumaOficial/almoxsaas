import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Supplier, SupplierFormData } from '@/hooks/useSuppliers'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  cnpj: z.string().nullable().optional(),
  email: z.string().email('E-mail inválido').nullable().optional()
    .or(z.literal('')),
  phone: z.string().nullable().optional(),
  contact: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface SupplierDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: SupplierFormData) => Promise<boolean>
  supplier?: Supplier | null
}

export function SupplierDrawer({ open, onClose, onSubmit, supplier }: SupplierDrawerProps) {
  const isEditing = !!supplier

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
  })

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        cnpj: supplier.cnpj,
        email: supplier.email,
        phone: supplier.phone,
        contact: supplier.contact,
        address: supplier.address,
        notes: supplier.notes,
        is_active: supplier.is_active,
      })
    } else {
      reset({
        name: '', cnpj: null, email: null, phone: null,
        contact: null, address: null, notes: null, is_active: true,
      })
    }
  }, [supplier, open])

  async function onFormSubmit(data: FormData) {
    const success = await onSubmit({
      ...data,
      email: data.email || null,
      cnpj: data.cnpj || null,
      phone: data.phone || null,
      contact: data.contact || null,
      address: data.address || null,
      notes: data.notes || null,
    })
    if (success) onClose()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Editar fornecedor' : 'Novo fornecedor'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 py-6">

          <div className="space-y-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" placeholder="Ex: Distribuidora ABC Ltda"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cnpj">CNPJ <span className="text-slate-400">(opcional)</span></Label>
              <Input id="cnpj" placeholder="00.000.000/0000-00" {...register('cnpj')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone <span className="text-slate-400">(opcional)</span></Label>
              <Input id="phone" placeholder="(71) 99999-9999" {...register('phone')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail <span className="text-slate-400">(opcional)</span></Label>
            <Input id="email" type="email" placeholder="contato@fornecedor.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''} />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact">Nome do contato <span className="text-slate-400">(opcional)</span></Label>
            <Input id="contact" placeholder="Ex: João Silva" {...register('contact')} />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="address">Endereço <span className="text-slate-400">(opcional)</span></Label>
            <Textarea id="address" placeholder="Rua, número, bairro, cidade - Estado"
              rows={2} {...register('address')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações <span className="text-slate-400">(opcional)</span></Label>
            <Textarea id="notes" placeholder="Informações adicionais sobre o fornecedor..."
              rows={2} {...register('notes')} />
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">Fornecedor ativo</p>
              <p className="text-xs text-slate-500">
                Fornecedores inativos não aparecem nas movimentações
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
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar fornecedor'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
