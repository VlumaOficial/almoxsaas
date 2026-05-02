import { useState, useMemo, useEffect } from 'react'
import { useProducts, Product } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useSuppliers } from '@/hooks/useSuppliers'
import { ProductTable } from '@/components/products/ProductTable'
import { ProductDrawer } from '@/components/products/ProductDrawer'
import { ProductFilters } from '@/components/products/ProductFilters'
import { ImportModal } from '@/components/products/ImportModal'
import { Button } from '@/components/ui/button'
import { Plus, FileSpreadsheet } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ProductsPage() {
  const { profile } = useAuth()
  const { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct, toggleProductStatus } = useProducts()
  const { categories, createCategory, fetchCategories } = useCategories()
  const { suppliers, addSupplier, refresh: refreshSuppliers } = useSuppliers()
  const canEdit = profile?.role && ['super_admin', 'owner', 'manager'].includes(profile.role)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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

  // Após criar categoria inline — atualiza lista
  async function handleCreateCategory(data: any) {
    const success = await createCategory(data)
    if (success) {
      await fetchCategories()
    }
    return success
  }

  // Após criar fornecedor inline — atualiza lista
  async function handleCreateSupplier(data: any) {
    await addSupplier(data as any)
    await refreshSuppliers()
    return true
  }

  // Resetar página ao filtrar
  useEffect(() => setCurrentPage(1), [search, categoryFilter, supplierFilter, statusFilter])

  // Filtragem local
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
      const matchCategory = categoryFilter === 'all' || p.category_id === categoryFilter
      const matchSupplier = supplierFilter === 'all' || p.supplier_id === supplierFilter
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && p.is_active) ||
        (statusFilter === 'inactive' && !p.is_active)
      return matchSearch && matchCategory && matchSupplier && matchStatus
    })
  }, [products, search, categoryFilter, supplierFilter, statusFilter])

  // Aplicar paginação após filtros
  const totalItems = filteredProducts.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <FileSpreadsheet size={16} className="mr-2" /> Importar
            </Button>
            <Button onClick={() => setDrawerOpen(true)} className="bg-blue-800 hover:bg-blue-900">
              <Plus size={16} className="mr-2" /> Novo produto
            </Button>
          </div>
        )}
      </div>

      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        supplierFilter={supplierFilter}
        onSupplierChange={setSupplierFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categories={categories}
        suppliers={suppliers}
      />

      <ProductTable
        products={paginatedProducts}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteProduct}
        onToggleStatus={toggleProductStatus}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1) }}
      />

      <ProductDrawer
        open={drawerOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        product={editingProduct}
        categories={categories}
        onCreateCategory={handleCreateCategory}
        suppliers={suppliers}
        onCreateSupplier={handleCreateSupplier}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          // Aguarda 500ms para garantir que o Supabase processou todos os inserts
          setTimeout(async () => {
            await fetchProducts()
          }, 500)
          setImportOpen(false)
        }}
      />
    </div>
  )
}