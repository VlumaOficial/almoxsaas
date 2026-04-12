import { useState } from 'react'
import { useProducts, Product } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../components/ui/table'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger 
} from '../components/ui/dialog'
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../components/ui/select'
import { Plus, Pencil, Trash2, Search, Package, Tag, Barcode } from 'lucide-react'
import { Badge } from '../components/ui/badge'

export default function ProductsPage() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts()
  const { categories } = useCategories()
  
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category_id: null,
    unit: 'un',
    min_stock: 0,
    description: '',
    cost_price: 0
  })

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  function handleOpenDialog(product?: Product) {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        sku: product.sku || '',
        category_id: product.category_id,
        unit: product.unit,
        min_stock: product.min_stock,
        description: product.description || '',
        cost_price: product.cost_price || 0
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        sku: '',
        category_id: null,
        unit: 'un',
        min_stock: 0,
        description: '',
        cost_price: 0
      })
    }
    setIsDialogOpen(true)
  }

  async function handleSubmit() {
    if (!formData.name?.trim()) return
    
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData)
    } else {
      await addProduct(formData)
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Produtos</h2>
          <p className="text-slate-500 text-sm">Gerencie o catálogo de itens do seu almoxarifado.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-blue-800 hover:bg-blue-900">
          <Plus size={18} className="mr-2" /> Novo Produto
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar por nome ou SKU..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>SKU / Código</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Estoque Mín.</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Carregando produtos...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Package size={32} className="text-slate-300" />
                    <p>Nenhum produto encontrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-slate-400 truncate max-w-[200px]">
                        {product.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.sku ? (
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {product.sku}
                      </Badge>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Tag size={12} className="text-blue-500" />
                        {product.category.name}
                      </div>
                    ) : (
                      <span className="text-slate-300">Sem categoria</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600 uppercase">{product.unit}</TableCell>
                  <TableCell className="text-right font-medium text-slate-700">
                    {product.min_stock}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenDialog(product)}
                        className="text-slate-400 hover:text-blue-600"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if(confirm('Deseja realmente excluir este produto?')) {
                            deleteProduct(product.id)
                          }
                        }}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input 
                id="name"
                placeholder="Ex: Parafuso Sextavado 1/2" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU / Código</Label>
                <Input 
                  id="sku"
                  placeholder="REF-001" 
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category_id || 'none'} 
                  onValueChange={(val) => setFormData({...formData, category_id: val === 'none' ? null : val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unit">Unidade de Medida</Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(val) => setFormData({...formData, unit: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade (un)</SelectItem>
                    <SelectItem value="kg">Quilo (kg)</SelectItem>
                    <SelectItem value="lt">Litro (lt)</SelectItem>
                    <SelectItem value="mt">Metro (mt)</SelectItem>
                    <SelectItem value="cx">Caixa (cx)</SelectItem>
                    <SelectItem value="pct">Pacote (pct)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="min_stock">Estoque Mínimo</Label>
                <Input 
                  id="min_stock"
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({...formData, min_stock: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description"
                placeholder="Detalhes técnicos, marca, etc."
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-blue-800 hover:bg-blue-900">
              {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}