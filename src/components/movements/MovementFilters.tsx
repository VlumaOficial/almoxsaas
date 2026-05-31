import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Search } from 'lucide-react'

interface MovementFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  typeFilter: string
  onTypeChange: (v: string) => void
  statusFilter: string
  onStatusChange: (v: string) => void
}

export function MovementFilters({
  search, onSearchChange,
  typeFilter, onTypeChange,
  statusFilter, onStatusChange,
}: MovementFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar por documento ou produto..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger className="w-44 shrink-0">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="entrada">Entrada</SelectItem>
          <SelectItem value="saida">Saida</SelectItem>
          <SelectItem value="transferencia">Transferencia</SelectItem>
          <SelectItem value="ajuste">Ajuste</SelectItem>
          <SelectItem value="inventario">Inventario</SelectItem>
          <SelectItem value="retorno">Retorno</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-36 shrink-0">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pendente">Pendente</SelectItem>
          <SelectItem value="aprovado">Aprovado</SelectItem>
          <SelectItem value="rejeitado">Rejeitado</SelectItem>
          <SelectItem value="cancelado">Cancelado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
