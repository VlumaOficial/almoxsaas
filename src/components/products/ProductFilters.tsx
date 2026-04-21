import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Category } from '@/hooks/useCategories'
import { Supplier } from '@/hooks/useSuppliers'
import { CategoryCombobox } from '@/components/products/CategoryCombobox'
import { SupplierCombobox } from '@/components/products/SupplierCombobox'
import { Search } from 'lucide-react'

interface ProductFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  supplierFilter: string
  onSupplierChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  categories: Category[]
  suppliers: Supplier[]
}

export function ProductFilters({
  search, onSearchChange,
  categoryFilter, onCategoryChange,
  supplierFilter, onSupplierChange,
  statusFilter, onStatusChange,
  categories, suppliers
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar por nome ou SKU..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <CategoryCombobox
        categories={categories}
        value={categoryFilter === 'all' ? null : categoryFilter}
        onChange={(val) => onCategoryChange(val || 'all')}
        placeholder="Todas as categorias"
      />
      <SupplierCombobox
        suppliers={suppliers}
        value={supplierFilter === 'all' ? null : supplierFilter}
        onChange={(val) => onSupplierChange(val || 'all')}
        placeholder="Todos os fornecedores"
      />
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
