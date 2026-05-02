import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { invalidateFeatureCache } from './useFeatureFlag'

export interface GlobalFlag {
  id: string
  feature: string
  enabled: boolean
  description: string
  updated_at: string
}

export interface PlanFlag {
  id: string
  feature: string
  plan: string
  enabled: boolean
}

export interface CompanyFlag {
  id: string
  feature: string
  company_id: string
  enabled: boolean
  notes: string | null
  company?: { name: string; plan: string }
}

export function useFeatureFlags() {
  const [globalFlags, setGlobalFlags] = useState<GlobalFlag[]>([])
  const [planFlags, setPlanFlags] = useState<PlanFlag[]>([])
  const [companyFlags, setCompanyFlags] = useState<CompanyFlag[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchAll() {
    setLoading(true)
    try {
      const [g, p, c] = await Promise.all([
        supabase.from('feature_flags_global').select('*').order('feature'),
        supabase.from('feature_flags_plan').select('*').order('feature'),
        supabase.from('feature_flags_company')
          .select('*, company:companies(name, plan)')
          .order('feature'),
      ])
      setGlobalFlags(g.data || [])
      setPlanFlags(p.data || [])
      setCompanyFlags(c.data || [])
    } finally {
      setLoading(false)
    }
  }

  async function updateGlobalFlag(feature: string, enabled: boolean) {
    const { error } = await supabase
      .from('feature_flags_global')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('feature', feature)

    if (error) { toast.error('Erro ao atualizar flag global'); return }
    toast.success(`Feature "${feature}" ${enabled ? 'habilitada' : 'desabilitada'} globalmente`)
    invalidateFeatureCache()
    await fetchAll()
  }

  async function updatePlanFlag(feature: string, plan: string, enabled: boolean) {
    const { error } = await supabase
      .from('feature_flags_plan')
      .upsert({ feature, plan, enabled, updated_at: new Date().toISOString() },
        { onConflict: 'feature,plan' })

    if (error) { toast.error('Erro ao atualizar flag por plano'); return }
    toast.success(`Feature "${feature}" ${enabled ? 'habilitada' : 'desabilitada'} para plano ${plan}`)
    invalidateFeatureCache()
    await fetchAll()
  }

  async function setCompanyFlag(
    feature: string,
    company_id: string,
    enabled: boolean,
    notes?: string
  ) {
    const { error } = await supabase
      .from('feature_flags_company')
      .upsert({ feature, company_id, enabled, notes, updated_at: new Date().toISOString() },
        { onConflict: 'feature,company_id' })

    if (error) { toast.error('Erro ao atualizar flag por empresa'); return }
    toast.success('Feature atualizada para a empresa')
    invalidateFeatureCache(company_id)
    await fetchAll()
  }

  async function removeCompanyFlag(feature: string, company_id: string) {
    const { error } = await supabase
      .from('feature_flags_company')
      .delete()
      .eq('feature', feature)
      .eq('company_id', company_id)

    if (error) { toast.error('Erro ao remover override'); return }
    toast.success('Override removido — regra do plano será aplicada')
    invalidateFeatureCache(company_id)
    await fetchAll()
  }

  useEffect(() => { fetchAll() }, [])

  return {
    globalFlags, planFlags, companyFlags, loading,
    updateGlobalFlag, updatePlanFlag, setCompanyFlag, removeCompanyFlag
  }
}
