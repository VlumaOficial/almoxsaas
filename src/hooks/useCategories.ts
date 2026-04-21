import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface Category {
  id: string
  company_id: string
  name: string
  parent_id: string | null
  is_active: boolean
  created_at: string
  parent?: { name: string } | null
}

export function useCategories() {
  const { company } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchCategories() {
    if (!company?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*, parent:categories!parent_id(name)')
        .eq('company_id', company.id)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  async function createCategory(data: { name: string; parent_id?: string | null }) {
    if (!company?.id) return false
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ ...data, company_id: company.id, is_active: true })

      if (error) throw error
      toast.success('Categoria criada com sucesso!')
      await fetchCategories()
      return true
    } catch (err) {
      toast.error('Erro ao criar categoria')
      return false
    }
  }

  async function updateCategory(id: string, data: { name: string; parent_id?: string | null }) {
    try {
      const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id)

      if (error) throw error
      toast.success('Categoria atualizada com sucesso!')
      await fetchCategories()
      return true
    } catch (err) {
      toast.error('Erro ao atualizar categoria')
      return false
    }
  }

  async function deleteCategory(id: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Categoria excluída com sucesso!')
      await fetchCategories()
      return true
    } catch (err) {
      toast.error('Erro ao excluir categoria. Verifique se não há produtos vinculados.')
      return false
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [company?.id])

  return { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory }
}