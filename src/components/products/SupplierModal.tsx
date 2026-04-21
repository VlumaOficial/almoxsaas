import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  cnpj: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface SupplierModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; cnpj?: string; email?: string; phone?: string }) => Promise<boolean>
}

export function SupplierModal({ open, onClose, onSubmit }: SupplierModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset({ name: '', cnpj: '', email: '', phone: '' })
    }
  }, [open])

  async function onFormSubmit(data: FormData) {
    const success = await onSubmit({
      name: data.name,
      cnpj: data.cnpj || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
    })
    if (success) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo fornecedor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Ex: Distribuidora ABC"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cnpj">CNPJ <span className="text-slate-400">(opcional)</span></Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              {...register('cnpj')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail <span className="text-slate-400">(opcional)</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="contato@fornecedor.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone <span className="text-slate-400">(opcional)</span></Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              {...register('phone')}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-800 hover:bg-blue-900" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Cadastrar fornecedor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
