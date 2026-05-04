import { useState } from 'react'
import { useWarehouses, Warehouse } from '@/hooks/useWarehouses'
import { useProfiles } from '@/hooks/useProfiles'
import { WarehouseDrawer } from '@/components/warehouses/WarehouseDrawer'
import { WarehouseTable } from '@/components/warehouses/WarehouseTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function WarehousesPage() {
  const {
    warehouses, loading,
    createWarehouse, updateWarehouse,
    deleteWarehouse, toggleWarehouseStatus
  } = useWarehouses()

  const { profiles } = useProfiles()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)

  function handleEdit(warehouse: Warehouse) {
    setEditingWarehouse(warehouse)
    setDrawerOpen(true)
  }

  function handleClose() {
    setDrawerOpen(false)
    setEditingWarehouse(null)
  }

  async function handleSubmit(data: any) {
    if (editingWarehouse) return updateWarehouse(editingWarehouse.id, data)
    return createWarehouse(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Almoxarifados</h2>
          <p className="text-slate-500 text-sm mt-1">
            {warehouses.length} almoxarifado{warehouses.length !== 1 ? 's' : ''} cadastrado{warehouses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setDrawerOpen(true)} className="bg-blue-800 hover:bg-blue-900">
          <Plus size={16} className="mr-2" /> Novo almoxarifado
        </Button>
      </div>

      <WarehouseTable
        warehouses={warehouses}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteWarehouse}
        onToggleStatus={toggleWarehouseStatus}
      />

      <WarehouseDrawer
        open={drawerOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        warehouse={editingWarehouse}
        profiles={profiles}
      />
    </div>
  )
}