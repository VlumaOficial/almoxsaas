import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Product, ProductFormData } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useSuppliers } from '@/hooks/useSuppliers'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { CategoryModal } from '@/components/categories/CategoryModal'
import { CategoryCombobox } from '@/components/products/CategoryCombobox'
import { SupplierCombobox } from '@/components/products/SupplierCombobox'
import { SupplierModal } from '@/components/products/SupplierModal'
import { Plus } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU/Código é obrigatório'),
  unit: z.string().min(1, 'Unidade obrigatória'),
  min_stock: z.coerce.number().min(0, 'Estoque mínimo deve ser 0 ou maior'),
  cost_price: z.coerce.number().nullable().optional(),
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  supplier_id: z.string().nullable().optional(),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

const UNITS = ['un', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'cx', 'pç', 'par', 'rolo', 'pacote']
const INTEGER_UNITS = ['un', 'cx', 'pç', 'par', 'rolo', 'pacote']

interface ProductDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ProductFormData) => Promise<boolean>
  product?: Product | null
}

export function ProductDrawer({ open, onClose, onSubmit, product }: ProductDrawerProps) {
  const isEditing = !!product
  const { categories, createCategory, fetchCategories } = useCategories()
  const { suppliers, addSupplier, refresh: refreshSuppliers } = useSuppliers()
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [supplierModalOpen, setSupplierModalOpen] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, min_stock: 0, unit: 'un' },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || '',
        sku: product.sku || '',
        unit: product.unit,
        min_stock: product.min_stock,
        cost_price: product.cost_price,
        category_id: product.category_id || '',
        supplier_id: product.supplier_id,
        is_active: product.is_active,
      })
    } else {
      reset({ name: '', description: '', sku: '', unit: 'un', min_stock: 0, cost_price: null, category_id: '', supplier_id: null, is_active: true })
    }
  }, [product, open, reset])

  async function onFormSubmit(data: FormData) {
    const success = await onSubmit({
      name: data.name,
      description: data.description,
      sku: data.sku,
      unit: data.unit,
      min_stock: data.min_stock,
      cost_price: data.cost_price || null,
      category_id: data.category_id,
      supplier_id: data.supplier_id || null,
      is_active: data.is_active,
    })
    if (success) onClose()
  }

  async function handleCreateCategory(data: { name: string; parent_id?: string | null }) {
    const success = await createCategory(data)
    if (success) {
      await fetchCategories()
      // Selecionar automaticamente a nova categoria
      const newCategory = categories.find(c => c.name === data.name && c.is_active)
      if (newCategory) {
        setValue('category_id', newCategory.id)
      }
    }
    return success
  }

  async function handleCreateSupplier(data: { name: string; cnpj?: string; email?: string; phone?: string }) {
    await addSupplier(data as any)
    await refreshSuppliers()
    // Selecionar automaticamente o novo fornecedor
    const newSupplier = suppliers.find(s => s.name === data.name && s.is_active)
    if (newSupplier) {
      setValue('supplier_id', newSupplier.id)
    }
    return true
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEditing ? 'Editar produto' : 'Novo produto'}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 py-6">

            {/* Nome */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" placeholder="Ex: Resma de Papel A4"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Descrição <span className="text-slate-400">(opcional)</span></Label>
              <Textarea id="description" placeholder="Detalhes do produto..."
                rows={3} {...register('description')} />
            </div>

            {/* SKU e Unidade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU / Código *</Label>
                <Input id="sku" placeholder="Ex: PRD-001" {...register('sku')} className={errors.sku ? 'border-red-500' : ''} />
                {errors.sku && <p className="text-red-500 text-xs">{errors.sku.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Unidade *</Label>
                <Select value={watch('unit')} onValueChange={(val) => setValue('unit', val)}>
                  <SelectTrigger className={errors.unit ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Estoque mínimo e Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="min_stock">Estoque mínimo *</Label>
                <Input
                  id="min_stock"
                  type="number"
                  step={INTEGER_UNITS.includes(watch('unit')) ? '1' : '0.01'}
                  min="0"
                  {...register('min_stock')}
                  className={errors.min_stock ? 'border-red-500' : ''} />
                {errors.min_stock && <p className="text-red-500 text-xs">{errors.min_stock.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cost_price">Preço de custo <span className="text-slate-400">(opcional)</span></Label>
                <Input id="cost_price" type="number" step="0.01" min="0"
                  placeholder="0,00" {...register('cost_price')} />
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Categoria *</Label>
                <button type="button"
                  onClick={() => setCategoryModalOpen(true)}
                  className="text-xs text-blue-700 hover:underline flex items-center gap-1">
                  <Plus size={12} /> Nova categoria
                </button>
              </div>
              <CategoryCombobox
                categories={categories.filter(c => c.is_active)}
                value={watch('category_id')}
                onChange={(val) => setValue('category_id', val)}
                placeholder="Selecione uma categoria"
              />
              {errors.category_id && <p className="text-red-500 text-xs">{errors.category_id.message}</p>}
            </div>

            {/* Fornecedor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Fornecedor <span className="text-slate-400">(opcional)</span></Label>
                <button type="button"
                  onClick={() => setSupplierModalOpen(true)}
                  className="text-xs text-blue-700 hover:underline flex items-center gap-1">
                  <Plus size={12} /> Novo fornecedor
                </button>
              </div>
              <SupplierCombobox
                suppliers={suppliers.filter(s => s.is_active)}
                value={watch('supplier_id')}
                onChange={(val) => setValue('supplier_id', val)}
                placeholder="Selecione um fornecedor"
              />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-900">Produto ativo</p>
                <p className="text-xs text-slate-500">Produtos inativos não aparecem nas movimentações</p>
              </div>
              <Switch
                checked={watch('is_active')}
                onCheckedChange={(val) => setValue('is_active', val)}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-blue-800 hover:bg-blue-900" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar produto'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Modal de nova categoria inline */}
      <CategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
        categories={categories}
      />

      {/* Modal de novo fornecedor inline */}
      <SupplierModal
        open={supplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        onSubmit={handleCreateSupplier}
      />
    </>
  )
}
