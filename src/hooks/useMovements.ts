import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export type MovementType =
  'entrada' | 'saida' | 'transferencia' | 'ajuste' | 'inventario' | 'retorno'

export type MovementStatus =
  'rascunho' | 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado'

export interface MovementItem {
  product_id: string
  quantity: number
  unit_cost?: number | null
  notes?: string | null
  product?: { name: string; unit: string; sku: string | null }
}

export interface Movement {
  id: string
  company_id: string
  warehouse_id: string
  warehouse_dest_id: string | null
  project_id: string | null
  origin_movement_id: string | null
  type: MovementType
  status: MovementStatus
  document_number: string | null
  notes: string | null
  occurred_at: string
  created_at: string
  requested_by: string | null
  approved_by: string | null
  warehouse?: { name: string }
  warehouse_dest?: { name: string }
  project?: { name: string }
  requested_by_profile?: { full_name: string }
  approved_by_profile?: { full_name: string }
  movement_items?: MovementItem[]
}

export interface MovementFormData {
  type: MovementType
  warehouse_id: string
  warehouse_dest_id?: string | null
  project_id?: string | null
  project_dest_id?: string | null
  transfer_subtype?: string | null
  origin_movement_id?: string | null
  notes?: string | null
  occurred_at: string
  items: {
    product_id: string
    quantity: number
    unit_cost?: number | null
    notes?: string | null
  }[]
}

export function useMovements() {
  const { company, profile } = useAuth()
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchMovements(filters?: {
    type?: MovementType
    status?: MovementStatus
    warehouse_id?: string
    project_id?: string
    dateFrom?: string
    dateTo?: string
  }) {
    if (!company?.id) return
    setLoading(true)
    try {
      let query = supabase
        .from('movements')
        .select(`
          *,
          warehouse:warehouses!movements_warehouse_id_fkey(name),
          warehouse_dest:warehouses!movements_warehouse_dest_id_fkey(name),
          project:projects(name),
          requested_by_profile:profiles!movements_requested_by_fkey(full_name),
          approved_by_profile:profiles!movements_approved_by_fkey(full_name),
          movement_items(
            product_id, quantity, unit_cost, notes,
            product:products(name, unit, sku)
          )
        `)
        .eq('company_id', company.id)
        .order('occurred_at', { ascending: false })

      if (filters?.type) query = query.eq('type', filters.type)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.warehouse_id) query = query.eq('warehouse_id', filters.warehouse_id)
      if (filters?.project_id) query = query.eq('project_id', filters.project_id)
      if (filters?.dateFrom) query = query.gte('occurred_at', filters.dateFrom)
      if (filters?.dateTo) query = query.lte('occurred_at', filters.dateTo)

      const { data, error } = await query
      if (error) throw error
      setMovements(data || [])
    } catch (err) {
      toast.error('Erro ao carregar movimentações')
    } finally {
      setLoading(false)
    }
  }

  async function updateStock(
    type: MovementType,
    companyId: string,
    warehouseId: string,
    warehouseDestId: string | null,
    items: { product_id: string; quantity: number }[]
  ) {
    for (const item of items) {
      if (type === 'entrada' || type === 'retorno') {
        const { data: existing } = await supabase
          .from('stock')
          .select('quantity')
          .eq('product_id', item.product_id)
          .eq('warehouse_id', warehouseId)
          .single()

        if (existing) {
          await supabase
            .from('stock')
            .update({ quantity: existing.quantity + item.quantity, updated_at: new Date().toISOString() })
            .eq('product_id', item.product_id)
            .eq('warehouse_id', warehouseId)
        } else {
          await supabase
            .from('stock')
            .insert({
              company_id: companyId,
              product_id: item.product_id,
              warehouse_id: warehouseId,
              quantity: item.quantity,
            })
        }
      } else if (type === 'saida') {
        const { data: existing } = await supabase
          .from('stock')
          .select('quantity')
          .eq('product_id', item.product_id)
          .eq('warehouse_id', warehouseId)
          .single()

        if (existing) {
          await supabase
            .from('stock')
            .update({ quantity: existing.quantity - item.quantity, updated_at: new Date().toISOString() })
            .eq('product_id', item.product_id)
            .eq('warehouse_id', warehouseId)
        }
      } else if (type === 'transferencia') {
        // Debita origem
        const { data: origin } = await supabase
          .from('stock')
          .select('quantity')
          .eq('product_id', item.product_id)
          .eq('warehouse_id', warehouseId)
          .single()

        if (origin) {
          await supabase
            .from('stock')
            .update({ quantity: origin.quantity - item.quantity, updated_at: new Date().toISOString() })
            .eq('product_id', item.product_id)
            .eq('warehouse_id', warehouseId)
        }

        // Credita destino
        if (warehouseDestId) {
          const { data: dest } = await supabase
            .from('stock')
            .select('quantity')
            .eq('product_id', item.product_id)
            .eq('warehouse_id', warehouseDestId)
            .single()

          if (dest) {
            await supabase
              .from('stock')
              .update({ quantity: dest.quantity + item.quantity, updated_at: new Date().toISOString() })
              .eq('product_id', item.product_id)
              .eq('warehouse_id', warehouseDestId)
          } else {
            await supabase
              .from('stock')
              .insert({
                company_id: companyId,
                product_id: item.product_id,
                warehouse_id: warehouseDestId,
                quantity: item.quantity,
              })
          }
        }
      } else if (type === 'ajuste' || type === 'inventario') {
        const { data: existing } = await supabase
          .from('stock')
          .select('quantity')
          .eq('product_id', item.product_id)
          .eq('warehouse_id', warehouseId)
          .single()

        if (existing) {
          await supabase
            .from('stock')
            .update({ quantity: item.quantity, updated_at: new Date().toISOString() })
            .eq('product_id', item.product_id)
            .eq('warehouse_id', warehouseId)
        } else {
          await supabase
            .from('stock')
            .insert({
              company_id: companyId,
              product_id: item.product_id,
              warehouse_id: warehouseId,
              quantity: item.quantity,
            })
        }
      }
    }
  }

  async function createMovement(data: MovementFormData): Promise<Movement | null> {
    if (!company?.id || !profile?.id) return null

    const isManager = ['manager', 'owner', 'super_admin'].includes(profile.role)
    const initialStatus: MovementStatus = isManager ? 'aprovado' : 'pendente'

    try {
      const { data: docNumber } = await supabase
        .rpc('generate_movement_number', {
          p_company_id: company.id,
          p_type: data.type,
        })

      const { data: movement, error: movError } = await supabase
        .from('movements')
        .insert({
          company_id: company.id,
          warehouse_id: data.warehouse_id,
          warehouse_dest_id: data.warehouse_dest_id || null,
          project_id: data.project_id || null,
          origin_movement_id: data.origin_movement_id || null,
          type: data.type,
          status: initialStatus,
          document_number: docNumber,
          notes: data.notes || null,
          occurred_at: data.occurred_at,
          requested_by: profile.id,
          approved_by: isManager ? profile.id : null,
        })
        .select()
        .single()

      if (movError) throw movError

      const items = data.items.map(item => ({
        movement_id: movement.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost || null,
        notes: item.notes || null,
      }))

      const { error: itemsError } = await supabase
        .from('movement_items')
        .insert(items)

      if (itemsError) throw itemsError

      // Atualiza estoque para movimentações aprovadas
      if (initialStatus === 'aprovado') {
        await updateStock(
          data.type,
          company.id,
          data.warehouse_id,
          data.warehouse_dest_id || null,
          data.items
        )
      }

      toast.success(
        isManager
          ? 'Movimentação registrada e aprovada!'
          : 'Solicitação criada! Aguardando aprovação do gestor.'
      )

      await fetchMovements()
      return movement
    } catch (err) {
      toast.error('Erro ao criar movimentação')
      return null
    }
  }

  async function approveMovement(id: string) {
    if (!profile?.id) return false
    try {
      const movement = movements.find(m => m.id === id)
      if (!movement) return false

      const { error } = await supabase
        .from('movements')
        .update({
          status: 'aprovado',
          approved_by: profile.id,
        })
        .eq('id', id)

      if (error) throw error

      // Atualiza estoque
      const items = movement.movement_items?.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })) || []

      await updateStock(
        movement.type,
        movement.company_id,
        movement.warehouse_id,
        movement.warehouse_dest_id,
        items
      )

      toast.success('Movimentação aprovada! Estoque atualizado.')
      await fetchMovements()
      return true
    } catch (err) {
      toast.error('Erro ao aprovar movimentação')
      return false
    }
  }

  async function rejectMovement(id: string, reason?: string) {
    try {
      const { error } = await supabase
        .from('movements')
        .update({
          status: 'rejeitado',
          notes: reason || null,
        })
        .eq('id', id)

      if (error) throw error
      toast.success('Movimentação rejeitada.')
      await fetchMovements()
      return true
    } catch (err) {
      toast.error('Erro ao rejeitar movimentação')
      return false
    }
  }

  async function cancelMovement(id: string) {
    try {
      const { error } = await supabase
        .from('movements')
        .update({ status: 'cancelado' })
        .eq('id', id)

      if (error) throw error
      toast.success('Movimentação cancelada.')
      await fetchMovements()
      return true
    } catch (err) {
      toast.error('Erro ao cancelar movimentação')
      return false
    }
  }

  async function createReturn(
    originMovement: Movement,
    items: { product_id: string; quantity: number }[]
  ): Promise<boolean> {
    if (!company?.id || !profile?.id) return false

    try {
      const data: MovementFormData = {
        type: 'retorno',
        warehouse_id: originMovement.warehouse_id,
        project_id: originMovement.project_id,
        origin_movement_id: originMovement.id,
        occurred_at: new Date().toISOString(),
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      }

      const result = await createMovement(data)
      return !!result
    } catch (err) {
      toast.error('Erro ao registrar retorno')
      return false
    }
  }

  useEffect(() => {
    fetchMovements()
  }, [company?.id])

  return {
    movements, loading, fetchMovements,
    createMovement, approveMovement,
    rejectMovement, cancelMovement, createReturn
  }
}
