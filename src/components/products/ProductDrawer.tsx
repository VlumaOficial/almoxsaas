import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Product, ProductFormData } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useWarehouses } from '@/hooks/useWarehouses'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { InitialStock } from '@/hooks/useProducts'
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
import { ImageUpload } from '@/components/products/ImageUpload'
import { Category } from '@/hooks/useCategories'
import { Supplier } from '@/hooks/useSuppliers'
import { Plus, Trash2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU/Código é obrigatório'),
  unit: z.string().min(1, 'Unidade obrigatória'),
  min_stock: z.coerce.number().min(0, 'Estoque mínimo deve ser 0 ou maior'),
  cost_price: z.coerce.number().nullable().optional(),
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  supplier_id: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
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
  categories: Category[]
  onCreateCategory: (data: any) => Promise<boolean>
  suppliers: Supplier[]
  onCreateSupplier: (data: any) => Promise<boolean>
}

export function ProductDrawer({ open, onClose, onSubmit, product, categories, onCreateCategory, suppliers, onCreateSupplier }: ProductDrawerProps) {
  const isEditing = !!product
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [supplierModalOpen, setSupplierModalOpen] = useState(false)
  const { enabled: canUploadImage } = useFeatureFlag('product_images')
  const { warehouses } = useWarehouses()
  const [initialStocks, setInitialStocks] = useState<InitialStock[]>([])

  function addStock() {
    setInitialStocks(prev => [...prev, { warehouse_id: '', quantity: 0 }])
  }

  function removeStock(index: number) {
    setInitialStocks(prev => prev.filter((_, i) => i !== index))
  }

  function updateStock(index: number, field: keyof InitialStock, value: any) {
    setInitialStocks(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  // Ref para guardar o nome do último item criado inline
  const lastCreatedCategory = useRef<string | null>(null)
  const lastCreatedSupplier = useRef<string | null>(null)

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
        image_url: product.image_url || null,
        is_active: product.is_active,
      })
    } else {
      reset({ name: '', description: '', sku: '', unit: 'un', min_stock: 0, cost_price: null, category_id: '', supplier_id: null, image_url: null, is_active: true })
      setInitialStocks([])
    }
  }, [product, open, reset])

  // Monitora mudanças na lista de categorias
  useEffect(() => {
    if (lastCreatedCategory.current) {
      const newCat = categories.find(c => c.name === lastCreatedCategory.current)
      if (newCat) {
        setValue('category_id', newCat.id)
        lastCreatedCategory.current = null
      }
    }
  }, [categories, setValue])

  // Monitora mudanças na lista de fornecedores
  useEffect(() => {
    if (lastCreatedSupplier.current) {
      const newSup = suppliers.find(s => s.name === lastCreatedSupplier.current)
      if (newSup) {
        setValue('supplier_id', newSup.id)
        lastCreatedSupplier.current = null
      }
    }
  }, [suppliers, setValue])

  async function onFormSubmit(data: FormData) {
    const success = await onSubmit({
      ...data,
      image_url: data.image_url || null,
      category_id: data.category_id || null,
      supplier_id: data.supplier_id || null,
      cost_price: data.cost_price || null,
      initial_stocks: initialStocks.filter(s => s.warehouse_id && s.quantity > 0),
    })
    if (success) onClose()
  }

  async function handleCreateCategory(data: { name: string; parent_id?: string | null }) {
    lastCreatedCategory.current = data.name
    const success = await onCreateCategory(data)
    if (!success) lastCreatedCategory.current = null
    return success
  }

  async function handleCreateSupplier(data: { name: string; cnpj?: string; email?: string; phone?: string }) {
    lastCreatedSupplier.current = data.name
    const success = await onCreateSupplier(data)
    if (!success) lastCreatedSupplier.current = null
    return success
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

            {/* Imagem do produto */}
            <div className="space-y-1.5">
              <Label>
                Imagem do produto
                {!canUploadImage && (
                  <span className="ml-2 text-xs text-slate-400">(não disponível no seu plano)</span>
                )}
              </Label>
              <ImageUpload
                currentImageUrl={watch('image_url')}
                onImageChange={(url) => setValue('image_url', url)}
                disabled={!canUploadImage}
              />
            </div>

            {!isEditing && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Estoque inicial por almoxarifado</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addStock}>
                    <Plus size={14} className="mr-1" /> Adicionar
                  </Button>
                </div>
                {initialStocks.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3 border-2 border-dashed border-slate-200 rounded-lg">
                    Clique em "Adicionar" para definir o estoque inicial por almoxarifado
                  </p>
                ) : (
                  <div className="space-y-2">
                    {initialStocks.map((stock, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1">
                          <select
                            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                            value={stock.warehouse_id}
                            onChange={e => updateStock(index, 'warehouse_id', e.target.value)}
                          >
                            <option value="">Selecione o almoxarifado</option>
                            {warehouses.filter(w => w.is_active).map(w => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Qtd"
                            value={stock.quantity || ''}
                            onChange={e => updateStock(index, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <Button type="button" variant="ghost" size="sm"
                          className="text-red-500 hover:text-red-700 shrink-0"
                          onClick={() => removeStock(index)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
