import { useState } from 'react'
import { useSuppliers, Supplier } from '../hooks/useSuppliers'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../components/ui/table'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '../components/ui/dialog'
import { Plus, Pencil, Trash2, Search, Truck, Phone, Mail } from 'lucide-react'

export default function SuppliersPage() {
  const { suppliers, loading, addSupplier, updateSupplier, deleteSupplier } = useSuppliers()
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '', cnpj: '', email: '', phone: '', contact: ''
  })

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.cnpj && s.cnpj.includes(search))
  )

  function handleOpenDialog(supplier?: Supplier) {
    if (supplier) {
      setEditingSupplier(supplier)
      setFormData({ ...supplier })
    } else {
      setEditingSupplier(null)
      setFormData({ name: '', cnpj: '', email: '', phone: '', contact: '' })
    }
    setIsDialogOpen(true)
  }

  async function handleSubmit() {
    if (!formData.name?.trim()) return
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, formData)
    } else {
      await addSupplier(formData)
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Fornecedores</h2>
          <p className="text-slate-500 text-sm">Gerencie seus parceiros e contatos.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-blue-800 hover:bg-blue-900">
          <Plus size={18} className="mr-2" /> Novo Fornecedor
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input placeholder="Buscar por nome ou CNPJ..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>E-mail / Telefone</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">Carregando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Truck size={32} className="text-slate-300" />
                    <p>Nenhum fornecedor encontrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{s.name}</div>
                    {s.cnpj && <div className="text-xs text-slate-400">{s.cnpj}</div>}
                  </TableCell>
                  <TableCell className="text-slate-600">{s.contact || '—'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {s.email && <div className="flex items-center gap-1.5 text-xs text-slate-500"><Mail size={12} /> {s.email}</div>}
                      {s.phone && <div className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={12} /> {s.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(s)} className="text-slate-400 hover:text-blue-600"><Pencil size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => confirm('Excluir?') && deleteSupplier(s.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></Button>
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
          <DialogHeader><DialogTitle>{editingSupplier ? 'Editar' : 'Novo'} Fornecedor</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome / Razão Social *</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>CNPJ</Label><Input value={formData.cnpj || ''} onChange={e => setFormData({...formData, cnpj: e.target.value})} /></div>
              <div className="grid gap-2"><Label>Contato</Label><Input value={formData.contact || ''} onChange={e => setFormData({...formData, contact: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>E-mail</Label><Input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div className="grid gap-2"><Label>Telefone</Label><Input value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
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