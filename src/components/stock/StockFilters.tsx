import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { Warehouse } from "@/hooks/useWarehouses"

interface StockFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: string
  onStatusChange: (v: string) => void
  warehouseFilter: string
  onWarehouseChange: (v: string) => void
  warehouses: Warehouse[]
}

export function StockFilters({
  search, onSearchChange,
  statusFilter, onStatusChange,
  warehouseFilter, onWarehouseChange,
  warehouses,
}: StockFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar por produto ou SKU..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={warehouseFilter} onValueChange={onWarehouseChange}>
        <SelectTrigger className="w-48 shrink-0">
          <SelectValue placeholder="Almoxarifado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os almoxarifados</SelectItem>
          {warehouses.filter(w => w.is_active).map(w => (
            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-36 shrink-0">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="baixo">Abaixo do minimo</SelectItem>
          <SelectItem value="zerado">Zerado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
