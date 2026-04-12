import { useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'
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
  image_url: string | null
  is_active: boolean
  created_at: string
  category?: { name: string }
  supplier?: { name: string }
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
    } catch (error: any) {
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  async function addProduct(product: Partial<Product>) {
    if (!company?.id) return
    try {
      const { error } = await supabase
        .from('products')
        .insert([{ ...product, company_id: company.id }])

      if (error) throw error
      toast.success('Produto cadastrado com sucesso')
      fetchProducts()
    } catch (error: any) {
      toast.error('Erro ao cadastrar produto')
    }
  }

  async function updateProduct(id: string, product: Partial<Product>) {
    try {
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)

      if (error) throw error
      toast.success('Produto atualizado')
      fetchProducts()
    } catch (error: any) {
      toast.error('Erro ao atualizar produto')
    }
  }

  async function deleteProduct(id: string) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Produto removido')
      fetchProducts()
    } catch (error: any) {
      toast.error('Não foi possível excluir. Verifique se há movimentações vinculadas.')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [company?.id])

  return { products, loading, addProduct, updateProduct, deleteProduct, refresh: fetchProducts }
}