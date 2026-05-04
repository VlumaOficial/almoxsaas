import { useState, useMemo } from 'react'
import { useSuppliers, Supplier } from '@/hooks/useSuppliers'
import { SupplierDrawer } from '@/components/suppliers/SupplierDrawer'
import { SupplierTable } from '@/components/suppliers/SupplierTable'
import { SupplierFilters } from '@/components/suppliers/SupplierFilters'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function SuppliersPage() {
  const {
    suppliers, loading,
    createSupplier, updateSupplier,
    deleteSupplier, toggleSupplierStatus
  } = useSuppliers()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  function handleEdit(supplier: Supplier) {
    setEditingSupplier(supplier)
    setDrawerOpen(true)
  }

  function handleClose() {
    setDrawerOpen(false)
    setEditingSupplier(null)
  }

  async function handleSubmit(data: any) {
    if (editingSupplier) return updateSupplier(editingSupplier.id, data)
    return createSupplier(data)
  }

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.cnpj && s.cnpj.includes(search))
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && s.is_active) ||
        (statusFilter === 'inactive' && !s.is_active)
      return matchSearch && matchStatus
    })
  }, [suppliers, search, statusFilter])

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Fornecedores</h2>
          <p className="text-slate-500 text-sm mt-1">
            {suppliers.length} fornecedor{suppliers.length !== 1 ? 'es' : ''} cadastrado{suppliers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setDrawerOpen(true)} className="bg-blue-800 hover:bg-blue-900">
          <Plus size={16} className="mr-2" /> Novo fornecedor
        </Button>
      </div>

      <SupplierFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setCurrentPage(1) }}
        statusFilter={statusFilter}
        onStatusChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}
      />

      <SupplierTable
        suppliers={paginatedSuppliers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteSupplier}
        onToggleStatus={toggleSupplierStatus}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Itens por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}
              className="border border-slate-200 rounded px-2 py-1 text-sm"
            >
              {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <span className="text-sm text-slate-500">
            Mostrando {Math.min((currentPage-1)*itemsPerPage+1, filteredSuppliers.length)} a{' '}
            {Math.min(currentPage*itemsPerPage, filteredSuppliers.length)} de{' '}
            {filteredSuppliers.length} fornecedores
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm"
              onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</Button>
            <Button variant="outline" size="sm"
              onClick={() => setCurrentPage(p => p-1)} disabled={currentPage === 1}>‹</Button>
            <span className="text-sm text-slate-600 px-2">
              Página {currentPage} de {totalPages}
            </span>
            <Button variant="outline" size="sm"
              onClick={() => setCurrentPage(p => p+1)} disabled={currentPage === totalPages}>›</Button>
            <Button variant="outline" size="sm"
              onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</Button>
          </div>
        </div>
      )}

      <SupplierDrawer
        open={drawerOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        supplier={editingSupplier}
      />
    </div>
  )
}