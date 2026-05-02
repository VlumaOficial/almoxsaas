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

export function useFeatureFlag(feature: FeatureKey): {
  enabled: boolean
  loading: boolean
} {
  const { company, profile } = useAuth()
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

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
  }, [company?.id, feature, profile?.role])

  return { enabled, loading }
}

export function invalidateFeatureCache(companyId?: string) {
  if (companyId) {
    Object.keys(flagCache).forEach(key => {
      if (key.startsWith(companyId)) delete flagCache[key]
    })
  } else {
    Object.keys(flagCache).forEach(key => delete flagCache[key])
  }
}
