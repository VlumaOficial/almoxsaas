import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface Warehouse {
  id: string
  company_id: string
  name: string
  description: string | null
  is_active: boolean
  responsible_id: string | null
  street: string | null
  number: string | null
  complement: string | null
  district: string | null
  city: string | null
  state: string | null
  zipcode: string | null
  created_at: string
  created_by: string | null
  responsible?: { full_name: string } | null
  creator?: { full_name: string } | null
}

export interface WarehouseFormData {
  name: string
  description?: string | null
  is_active: boolean
  responsible_id?: string | null
  street?: string | null
  number?: string | null
  complement?: string | null
  district?: string | null
  city?: string | null
  state?: string | null
  zipcode?: string | null
}

export function useWarehouses() {
  const { company, profile } = useAuth()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchWarehouses() {
    if (!company?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select(`
          *,
          responsible:profiles!warehouses_responsible_id_fkey(full_name),
          creator:profiles!warehouses_created_by_fkey(full_name)
        `)
        .eq('company_id', company.id)
        .order('name')

      if (error) throw error
      setWarehouses(data || [])
    } catch (err) {
      toast.error('Erro ao carregar almoxarifados')
    } finally {
      setLoading(false)
    }
  }

  async function createWarehouse(data: WarehouseFormData) {
    if (!company?.id) return false
    try {
      const { error } = await supabase
        .from('warehouses')
        .insert({
          ...data,
          company_id: company.id,
          created_by: profile?.id,
        })

      if (error) throw error
      toast.success('Almoxarifado criado com sucesso!')
      await fetchWarehouses()
      return true
    } catch (err) {
      toast.error('Erro ao criar almoxarifado')
      return false
    }
  }

  async function updateWarehouse(id: string, data: WarehouseFormData) {
    try {
      const { error } = await supabase
        .from('warehouses')
        .update(data)
        .eq('id', id)

      if (error) throw error
      toast.success('Almoxarifado atualizado com sucesso!')
      await fetchWarehouses()
      return true
    } catch (err) {
      toast.error('Erro ao atualizar almoxarifado')
      return false
    }
  }

  async function deleteWarehouse(id: string) {
    try {
      const { count } = await supabase
        .from('stock')
        .select('id', { count: 'exact', head: true })
        .eq('warehouse_id', id)
        .gt('quantity', 0)

      if (count && count > 0) {
        toast.error('Almoxarifado com estoque não pode ser excluído. Transfira o estoque primeiro.')
        return false
      }

      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Almoxarifado excluído com sucesso!')
      await fetchWarehouses()
      return true
    } catch (err) {
      toast.error('Erro ao excluir almoxarifado')
      return false
    }
  }

  async function toggleWarehouseStatus(id: string, is_active: boolean) {
    try {
      const { error } = await supabase
        .from('warehouses')
        .update({ is_active })
        .eq('id', id)

      if (error) throw error
      toast.success(is_active ? 'Almoxarifado ativado!' : 'Almoxarifado desativado!')
      await fetchWarehouses()
      return true
    } catch (err) {
      toast.error('Erro ao alterar status')
      return false
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [company?.id])

  return {
    warehouses, loading, fetchWarehouses,
    createWarehouse, updateWarehouse,
    deleteWarehouse, toggleWarehouseStatus
  }
}