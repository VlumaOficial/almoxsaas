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
  image_url: string | null
  is_active: boolean
  created_at: string
  category?: { name: string } | null
  supplier?: { name: string } | null
  creator?: { full_name: string } | null
}

export interface InitialStock {
  warehouse_id: string
  quantity: number
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
  initial_stocks?: InitialStock[]
}

export function useProducts() {
  const { company, profile } = useAuth()
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
          supplier:suppliers(name),
          creator:profiles!products_created_by_fkey(full_name)
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
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          description: data.description || null,
          sku: data.sku || null,
          unit: data.unit,
          min_stock: data.min_stock,
          cost_price: data.cost_price || null,
          category_id: data.category_id || null,
          supplier_id: data.supplier_id || null,
          is_active: data.is_active,
          company_id: company.id,
          created_by: profile?.id,
        } as any)
        .select()
        .single()

      if (error) throw error

      if (import.meta.env.DEV) console.log('[createProduct] produto criado:', product)
      if (import.meta.env.DEV) console.log('[createProduct] initial_stocks recebidos:', data.initial_stocks)

      // Processa estoque inicial por almoxarifado
      if (data.initial_stocks && data.initial_stocks.length > 0) {
        if (import.meta.env.DEV) console.log('[createProduct] processando estoque inicial...')
        for (const stock of data.initial_stocks) {
          if (import.meta.env.DEV) console.log('[createProduct] stock item:', stock)
          if (stock.quantity <= 0) continue

          // Cria ou atualiza registro de estoque
          const { error: stockError } = await supabase
            .from('stock')
            .upsert({
              company_id: company.id,
              product_id: product.id,
              warehouse_id: stock.warehouse_id,
              quantity: stock.quantity,
            }, { onConflict: 'product_id,warehouse_id' })
          if (import.meta.env.DEV) console.log('[createProduct] stockError:', stockError)

          // Cria movimentação de inventário para rastreabilidade
          const { data: docNumber } = await supabase
            .rpc('generate_movement_number', {
              p_company_id: company.id,
              p_type: 'inventario',
            })

          const { data: movement } = await supabase
            .from('movements')
            .insert({
              company_id: company.id,
              warehouse_id: stock.warehouse_id,
              type: 'inventario',
              status: 'aprovado',
              document_number: docNumber,
              notes: 'Estoque inicial no cadastro do produto',
              occurred_at: new Date().toISOString(),
              requested_by: profile?.id,
              approved_by: profile?.id,
            })
            .select()
            .single()

          if (movement) {
            await supabase
              .from('movement_items')
              .insert({
                movement_id: movement.id,
                product_id: product.id,
                quantity: stock.quantity,
                unit_cost: data.cost_price || null,
              })
          }
        }
      }

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
      // Verifica se tem movimentações vinculadas
      const { count } = await supabase
        .from('movement_items')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', id)

      if (count && count > 0) {
        toast.error('Produto com movimentações não pode ser excluído. Desative-o.')
        return false
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Produto excluído com sucesso!')
      await fetchProducts()
      return true
    } catch (err) {
      toast.error('Erro ao excluir produto')
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