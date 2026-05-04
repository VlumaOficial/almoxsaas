import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface ProfileBasic {
  id: string
  full_name: string
  role: string
  email: string
}

export function useProfiles() {
  const { company } = useAuth()
  const [profiles, setProfiles] = useState<ProfileBasic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!company?.id) return

    supabase
      .from('profiles')
      .select('id, full_name, role, email')
      .eq('company_id', company.id)
      .eq('is_active', true)
      .order('full_name')
      .then(({ data }) => {
        setProfiles(data || [])
        setLoading(false)
      })
  }, [company?.id])

  return { profiles, loading }
}
