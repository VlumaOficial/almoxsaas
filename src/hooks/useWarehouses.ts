import { useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export interface Warehouse {
  id: string
  name: string
  description: string | null
  location: string | null
  is_active: boolean
  created_at: string
}

export function useWarehouses() {
  const { company } = useAuth()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchWarehouses() {
    if (!company?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('company_id', company.id)
        .order('name')

      if (error) throw error
      setWarehouses(data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar almoxarifados')
    } finally {
      setLoading(false)
    }
  }

  async function addWarehouse(warehouse: Partial<Warehouse>) {
    if (!company?.id) return
    try {
      const { error } = await supabase
        .from('warehouses')
        .insert([{ ...warehouse, company_id: company.id }])

      if (error) throw error
      toast.success('Almoxarifado criado com sucesso')
      fetchWarehouses()
    } catch (error: any) {
      toast.error('Erro ao criar almoxarifado')
    }
  }

  async function updateWarehouse(id: string, warehouse: Partial<Warehouse>) {
    try {
      const { error } = await supabase
        .from('warehouses')
        .update(warehouse)
        .eq('id', id)

      if (error) throw error
      toast.success('Almoxarifado atualizado')
      fetchWarehouses()
    } catch (error: any) {
      toast.error('Erro ao atualizar almoxarifado')
    }
  }

  async function deleteWarehouse(id: string) {
    try {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Almoxarifado removido')
      fetchWarehouses()
    } catch (error: any) {
      toast.error('Não foi possível excluir. Verifique se há estoque vinculado.')
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [company?.id])

  return { warehouses, loading, addWarehouse, updateWarehouse, deleteWarehouse, refresh: fetchWarehouses }
}