import { useState, useMemo } from 'react'
import { useProducts, Product } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { ProductTable } from '@/components/products/ProductTable'
import { ProductDrawer } from '@/components/products/ProductDrawer'
import { ProductFilters } from '@/components/products/ProductFilters'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ProductsPage() {
  const { profile } = useAuth()
  const { products, loading, createProduct, updateProduct, deleteProduct, toggleProductStatus } = useProducts()
  const { categories } = useCategories()
  const canEdit = profile?.role && ['super_admin', 'owner', 'manager'].includes(profile.role)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setDrawerOpen(true)
  }

  function handleClose() {
    setDrawerOpen(false)
    setEditingProduct(null)
  }

  async function handleSubmit(data: any) {
    if (editingProduct) return updateProduct(editingProduct.id, data)
    return createProduct(data)
  }

  // Filtragem local
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
      const matchCategory = categoryFilter === 'all' || p.category_id === categoryFilter
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && p.is_active) ||
        (statusFilter === 'inactive' && !p.is_active)
      return matchSearch && matchCategory && matchStatus
    })
  }, [products, search, categoryFilter, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Produtos</h2>
          <p className="text-slate-500 text-sm mt-1">
            {products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setDrawerOpen(true)} className="bg-blue-800 hover:bg-blue-900">
            <Plus size={16} className="mr-2" /> Novo produto
          </Button>
        )}
      </div>

      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categories={categories}
      />

      <ProductTable
        products={filteredProducts}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteProduct}
        onToggleStatus={toggleProductStatus}
      />

      <ProductDrawer
        open={drawerOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        product={editingProduct}
      />
    </div>
  )
}