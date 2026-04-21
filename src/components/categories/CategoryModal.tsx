import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Category } from '@/hooks/useCategories'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  parent_id: z.string().nullable().optional(),
})

type FormData = z.infer<typeof schema>

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; parent_id?: string | null }) => Promise<boolean>
  category?: Category | null
  categories: Category[]
}

export function CategoryModal({ open, onClose, onSubmit, category, categories }: CategoryModalProps) {
  const isEditing = !!category

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (category) {
      reset({ name: category.name, parent_id: category.parent_id })
    } else {
      reset({ name: '', parent_id: null })
    }
  }, [category, open])

  async function onFormSubmit(data: FormData) {
    const success = await onSubmit({
      name: data.name,
      parent_id: data.parent_id || null,
    })
    if (success) onClose()
  }

  // Filtra a categoria atual para não aparecer como pai dela mesma
  const parentOptions = categories.filter(c =>
    c.id !== category?.id && c.is_active
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Ex: Materiais de Escritório"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Categoria pai <span className="text-slate-400">(opcional)</span></Label>
            <Select
              value={watch('parent_id') || 'none'}
              onValueChange={(val) => setValue('parent_id', val === 'none' ? null : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhuma (categoria raiz)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma (categoria raiz)</SelectItem>
                {parentOptions.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-800 hover:bg-blue-900" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar categoria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
