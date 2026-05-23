import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export type ProjectStatus =
  'planejamento' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado'

export interface Project {
  id: string
  company_id: string
  name: string
  description: string | null
  responsible_id: string | null
  status: ProjectStatus
  started_at: string | null
  ended_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  responsible?: { full_name: string } | null
  creator?: { full_name: string } | null
  movements_count?: number
}

export interface ProjectFormData {
  name: string
  description?: string | null
  responsible_id?: string | null
  status: ProjectStatus
  started_at?: string | null
  ended_at?: string | null
}

export interface ProjectStats {
  total_saidas: number
  total_devolvido: number
  saldo_campo: number
  custo_total: number
  movements: {
    id: string
    type: string
    occurred_at: string
    requested_by_name: string | null
    items: {
      product_name: string
      quantity: number
      unit: string
      unit_cost: number | null
    }[]
  }[]
}

export function useProjects() {
  const { company, profile } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchProjects() {
    if (!company?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          responsible:profiles!projects_responsible_id_fkey(full_name),
          creator:profiles!projects_created_by_fkey(full_name),
          movements_count:movements(count)
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      toast.error('Erro ao carregar projetos')
    } finally {
      setLoading(false)
    }
  }

  async function createProject(data: ProjectFormData) {
    if (!company?.id) return false
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          ...data,
          company_id: company.id,
          created_by: profile?.id,
        })

      if (error) throw error
      toast.success('Projeto criado com sucesso!')
      await fetchProjects()
      return true
    } catch (err) {
      toast.error('Erro ao criar projeto')
      return false
    }
  }

  async function updateProject(id: string, data: ProjectFormData) {
    try {
      const { error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id)

      if (error) throw error
      toast.success('Projeto atualizado com sucesso!')
      await fetchProjects()
      return true
    } catch (err) {
      toast.error('Erro ao atualizar projeto')
      return false
    }
  }

  async function deleteProject(id: string) {
    try {
      const { count } = await supabase
        .from('movements')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', id)

      if (count && count > 0) {
        toast.error('Projeto com movimentações não pode ser excluído.')
        return false
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Projeto excluído com sucesso!')
      await fetchProjects()
      return true
    } catch (err) {
      toast.error('Erro ao excluir projeto')
      return false
    }
  }

  async function fetchProjectStats(projectId: string): Promise<ProjectStats | null> {
    try {
      const { data: movements } = await supabase
        .from('movements')
        .select(`
          id, type, occurred_at, status,
          requested_by_profile:profiles!movements_requested_by_fkey(full_name),
          movement_items(
            quantity, unit_cost,
            product:products(name, unit)
          )
        `)
        .eq('project_id', projectId)
        .eq('status', 'aprovado')
        .order('occurred_at', { ascending: false })

      if (!movements) return null

      let total_saidas = 0
      let total_devolvido = 0
      let custo_total = 0

      const formattedMovements = movements.map((m: any) => {
        const items = (m.movement_items || []).map((item: any) => {
          const qty = item.quantity || 0
          const cost = item.unit_cost || 0

          if (m.type === 'saida') {
            total_saidas += qty
            custo_total += qty * cost
          } else if (m.type === 'movement_return') {
            total_devolvido += qty
          }

          return {
            product_name: item.product?.name || '-',
            quantity: qty,
            unit: item.product?.unit || 'un',
            unit_cost: cost,
          }
        })

        return {
          id: m.id,
          type: m.type,
          occurred_at: m.occurred_at,
          requested_by_name: m.requested_by_profile?.full_name || null,
          items,
        }
      })

      return {
        total_saidas,
        total_devolvido,
        saldo_campo: total_saidas - total_devolvido,
        custo_total,
        movements: formattedMovements,
      }
    } catch (err) {
      toast.error('Erro ao carregar estatísticas do projeto')
      return null
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [company?.id])

  return {
    projects, loading, fetchProjects,
    createProject, updateProject,
    deleteProject, fetchProjectStats
  }
}