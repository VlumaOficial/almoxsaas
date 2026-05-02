import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export type FeatureKey =
  | 'product_images' | 'product_barcode' | 'product_price_history'
  | 'movement_multi_approval' | 'movement_attachments' | 'movement_digital_sign'
  | 'movement_batch_tracking' | 'movement_return'
  | 'export_excel_pdf' | 'advanced_reports' | 'analytics_dashboard' | 'scheduled_reports'
  | 'two_factor_auth' | 'audit_log' | 'ip_restriction'
  | 'multiple_warehouses' | 'shelf_addressing' | 'cyclic_inventory'
  | 'public_api' | 'webhooks' | 'erp_integration' | 'whatsapp_notifications' | 'nfe_integration'
  | 'mobile_pwa' | 'barcode_scanner' | 'push_notifications'

const flagCache: Record<string, boolean> = {}
const listeners: Set<() => void> = new Set()

// Notifica todos os hooks quando uma flag muda
function notifyListeners() {
  listeners.forEach(fn => fn())
}

export function invalidateFeatureCache(companyId?: string) {
  if (companyId) {
    Object.keys(flagCache).forEach(key => {
      if (key.startsWith(companyId)) delete flagCache[key]
    })
  } else {
    Object.keys(flagCache).forEach(key => delete flagCache[key])
  }
  notifyListeners()
}

export function useFeatureFlag(feature: FeatureKey): {
  enabled: boolean
  loading: boolean
} {
  const { company, profile } = useAuth()
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0) // força re-render quando cache invalida

  // Escuta invalidações de cache
  useEffect(() => {
    const listener = () => setTick(t => t + 1)
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, [])

  // Escuta mudanças em tempo real nas tabelas de flags
  useEffect(() => {
    const channelName = `feature-flags-${Math.random().toString(36).substring(7)}`

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'feature_flags_global',
      }, (payload) => {
        console.log('Flag global mudou:', payload)
        invalidateFeatureCache()
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'feature_flags_plan',
      }, (payload) => {
        console.log('Flag plano mudou:', payload)
        invalidateFeatureCache()
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'feature_flags_company',
      }, (payload) => {
        console.log('Flag empresa mudou:', payload)
        if (company?.id) invalidateFeatureCache(company.id)
        else invalidateFeatureCache()
      })
      .subscribe((status) => {
        console.log('Status canal:', channelName, status)
      })

    return () => { supabase.removeChannel(channel) }
  }, [company?.id])

  useEffect(() => {
    // Super Admin sempre tem acesso a tudo
    if (profile?.role === 'super_admin') {
      setEnabled(true)
      setLoading(false)
      return
    }

    if (!company?.id) return

    const cacheKey = `${company.id}:${feature}` 

    if (flagCache[cacheKey] !== undefined) {
      setEnabled(flagCache[cacheKey])
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .rpc('is_feature_enabled', {
        p_feature: feature,
        p_company_id: company.id,
      })
      .then(({ data }) => {
        const result = !!data
        flagCache[cacheKey] = result
        setEnabled(result)
        setLoading(false)
      })
  }, [company?.id, feature, profile?.role, tick])

  return { enabled, loading }
}
