import { useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export interface Category {
  id: string
  name: string
  parent_id: string | null
  is_active: boolean
  created_at: string
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
        .select('*')
        .eq('company_id', company.id)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  async function addCategory(name: string) {
    if (!company?.id) return
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name, company_id: company.id }])

      if (error) throw error
      toast.success('Categoria criada com sucesso')
      fetchCategories()
    } catch (error: any) {
      toast.error('Erro ao criar categoria')
    }
  }

  async function updateCategory(id: string, name: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)

      if (error) throw error
      toast.success('Categoria atualizada')
      fetchCategories()
    } catch (error: any) {
      toast.error('Erro ao atualizar categoria')
    }
  }

  async function deleteCategory(id: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Categoria removida')
      fetchCategories()
    } catch (error: any) {
      toast.error('Não foi possível excluir. Verifique se há produtos vinculados.')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [company?.id])

  return { categories, loading, addCategory, updateCategory, deleteCategory, refresh: fetchCategories }
}