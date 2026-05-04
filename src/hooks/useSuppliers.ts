import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface Supplier {
  id: string
  company_id: string
  name: string
  cnpj: string | null
  email: string | null
  phone: string | null
  contact: string | null
  address: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  created_by: string | null
  creator?: { full_name: string } | null
}

export interface SupplierFormData {
  name: string
  cnpj?: string | null
  email?: string | null
  phone?: string | null
  contact?: string | null
  address?: string | null
  notes?: string | null
  is_active: boolean
}

export function useSuppliers() {
  const { company, profile } = useAuth()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchSuppliers() {
    if (!company?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          *,
          creator:profiles!suppliers_created_by_fkey(full_name)
        `)
        .eq('company_id', company.id)
        .order('name')

      if (error) throw error
      setSuppliers(data || [])
    } catch (err) {
      toast.error('Erro ao carregar fornecedores')
    } finally {
      setLoading(false)
    }
  }

  async function createSupplier(data: SupplierFormData) {
    if (!company?.id) return false
    try {
      const { error } = await supabase
        .from('suppliers')
        .insert({
          ...data,
          company_id: company.id,
          created_by: profile?.id,
        })

      if (error) throw error
      toast.success('Fornecedor criado com sucesso!')
      await fetchSuppliers()
      return true
    } catch (err) {
      toast.error('Erro ao criar fornecedor')
      return false
    }
  }

  async function updateSupplier(id: string, data: SupplierFormData) {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(data)
        .eq('id', id)

      if (error) throw error
      toast.success('Fornecedor atualizado com sucesso!')
      await fetchSuppliers()
      return true
    } catch (err) {
      toast.error('Erro ao atualizar fornecedor')
      return false
    }
  }

  async function deleteSupplier(id: string) {
    try {
      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('supplier_id', id)

      if (count && count > 0) {
        toast.error('Fornecedor com produtos vinculados não pode ser excluído. Desvincule os produtos primeiro.')
        return false
      }

      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Fornecedor excluído com sucesso!')
      await fetchSuppliers()
      return true
    } catch (err) {
      toast.error('Erro ao excluir fornecedor')
      return false
    }
  }

  async function toggleSupplierStatus(id: string, is_active: boolean) {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ is_active })
        .eq('id', id)

      if (error) throw error
      toast.success(is_active ? 'Fornecedor ativado!' : 'Fornecedor desativado!')
      await fetchSuppliers()
      return true
    } catch (err) {
      toast.error('Erro ao alterar status')
      return false
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [company?.id])

  return {
    suppliers, loading, fetchSuppliers,
    createSupplier, updateSupplier,
    deleteSupplier, toggleSupplierStatus
  }
}