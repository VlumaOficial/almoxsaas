import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface Product {
  id: string
  company_id: string
  category_id: string | null
  supplier_id: string | null
  name: string
  description: string | null
  sku: string | null
  unit: string
  min_stock: number
  cost_price: number | null
  is_active: boolean
  created_at: string
  category?: { name: string } | null
  supplier?: { name: string } | null
}

export interface ProductFormData {
  name: string
  description?: string
  sku?: string
  unit: string
  min_stock: number
  cost_price?: number | null
  category_id?: string | null
  supplier_id?: string | null
  is_active: boolean
}

export function useProducts() {
  const { company } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchProducts() {
    if (!company?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          supplier:suppliers(name)
        `)
        .eq('company_id', company.id)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  async function createProduct(data: ProductFormData) {
    if (!company?.id) return false
    try {
      const { error } = await supabase
        .from('products')
        .insert({ ...data, company_id: company.id } as any)

      if (error) throw error
      toast.success('Produto criado com sucesso!')
      await fetchProducts()
      return true
    } catch (err: any) {
      if (err.code === '23505') {
        toast.error('Já existe um produto com este SKU.')
      } else {
        toast.error('Erro ao criar produto')
      }
      return false
    }
  }

  async function updateProduct(id: string, data: ProductFormData) {
    try {
      const { error } = await supabase
        .from('products')
        .update(data as any)
        .eq('id', id)

      if (error) throw error
      toast.success('Produto atualizado com sucesso!')
      await fetchProducts()
      return true
    } catch (err: any) {
      if (err.code === '23505') {
        toast.error('Já existe um produto com este SKU.')
      } else {
        toast.error('Erro ao atualizar produto')
      }
      return false
    }
  }

  async function deleteProduct(id: string) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Produto excluído com sucesso!')
      await fetchProducts()
      return true
    } catch (err) {
      toast.error('Erro ao excluir produto. Verifique se não há movimentações vinculadas.')
      return false
    }
  }

  async function toggleProductStatus(id: string, is_active: boolean) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active } as any)
        .eq('id', id)

      if (error) throw error
      toast.success(is_active ? 'Produto ativado!' : 'Produto desativado!')
      await fetchProducts()
      return true
    } catch (err) {
      toast.error('Erro ao alterar status do produto')
      return false
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [company?.id])

  return {
    products, loading, fetchProducts,
    createProduct, updateProduct, deleteProduct, toggleProductStatus
  }
}