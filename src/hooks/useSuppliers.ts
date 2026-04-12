import { useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export interface Supplier {
  id: string
  name: string
  cnpj: string | null
  email: string | null
  phone: string | null
  contact: string | null
  is_active: boolean
  created_at: string
}

export function useSuppliers() {
  const { company } = useAuth()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchSuppliers() {
    if (!company?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('company_id', company.id)
        .order('name')

      if (error) throw error
      setSuppliers(data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar fornecedores')
    } finally {
      setLoading(false)
    }
  }

  async function addSupplier(supplier: Partial<Supplier>) {
    if (!company?.id) return
    try {
      const { error } = await supabase
        .from('suppliers')
        .insert([{ ...supplier, company_id: company.id }])

      if (error) throw error
      toast.success('Fornecedor cadastrado')
      fetchSuppliers()
    } catch (error: any) {
      toast.error('Erro ao cadastrar fornecedor')
    }
  }

  async function updateSupplier(id: string, supplier: Partial<Supplier>) {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(supplier)
        .eq('id', id)

      if (error) throw error
      toast.success('Fornecedor atualizado')
      fetchSuppliers()
    } catch (error: any) {
      toast.error('Erro ao atualizar fornecedor')
    }
  }

  async function deleteSupplier(id: string) {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Fornecedor removido')
      fetchSuppliers()
    } catch (error: any) {
      toast.error('Não foi possível excluir.')
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [company?.id])

  return { suppliers, loading, addSupplier, updateSupplier, deleteSupplier, refresh: fetchSuppliers }
}