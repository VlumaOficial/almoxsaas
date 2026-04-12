import { useState } from 'react'
import { useWarehouses, Warehouse } from '../hooks/useWarehouses'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../components/ui/table'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '../components/ui/dialog'
import { Plus, Pencil, Trash2, Search, Warehouse as WarehouseIcon, MapPin } from 'lucide-react'

export default function WarehousesPage() {
  const { warehouses, loading, addWarehouse, updateWarehouse, deleteWarehouse } = useWarehouses()
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  
  const [formData, setFormData] = useState<Partial<Warehouse>>({
    name: '',
    location: '',
    description: ''
  })

  const filtered = warehouses.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    (w.location && w.location.toLowerCase().includes(search.toLowerCase()))
  )

  function handleOpenDialog(warehouse?: Warehouse) {
    if (warehouse) {
      setEditingWarehouse(warehouse)
      setFormData({
        name: warehouse.name,
        location: warehouse.location || '',
        description: warehouse.description || ''
      })
    } else {
      setEditingWarehouse(null)
      setFormData({ name: '', location: '', description: '' })
    }
    setIsDialogOpen(true)
  }

  async function handleSubmit() {
    if (!formData.name?.trim()) return
    if (editingWarehouse) {
      await updateWarehouse(editingWarehouse.id, formData)
    } else {
      await addWarehouse(formData)
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Almoxarifados</h2>
          <p className="text-slate-500 text-sm">Gerencie os locais físicos de armazenamento.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-blue-800 hover:bg-blue-900">
          <Plus size={18} className="mr-2" /> Novo Almoxarifado
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar por nome ou localização..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">Carregando...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <WarehouseIcon size={32} className="text-slate-300" />
                    <p>Nenhum almoxarifado encontrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium text-slate-900">{w.name}</TableCell>
                  <TableCell className="text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" />
                      {w.location || <span className="text-slate-300">Não informada</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs max-w-xs truncate">
                    {w.description || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(w)} className="text-slate-400 hover:text-blue-600">
                        <Pencil size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => confirm('Excluir?') && deleteWarehouse(w.id)} className="text-slate-400 hover:text-red-600">
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
        <DialogContent>
          <DialogHeader><DialogTitle>{editingWarehouse ? 'Editar' : 'Novo'} Almoxarifado</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome *</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Depósito Central" />
            </div>
            <div className="grid gap-2">
              <Label>Localização</Label>
              <Input value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Ex: Bloco A, Prateleira 2" />
            </div>
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detalhes adicionais..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-blue-800 hover:bg-blue-900">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}