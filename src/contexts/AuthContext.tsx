import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../integrations/supabase/client'
import { toast } from 'sonner'

interface Profile {
  id: string
  company_id: string
  full_name: string
  email: string
  role: 'super_admin' | 'owner' | 'manager' | 'operator'
  is_active: boolean
}

interface Company {
  id: string
  name: string
  status: 'trial' | 'active' | 'blocked' | 'cancelled'
  plan: 'starter' | 'professional' | 'enterprise'
  trial_ends_at: string
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  company: Company | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const profileLoading = useRef(false) // evita chamadas duplas

  useEffect(() => {
    let mounted = true

    // 1. Verifica sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id, mounted)
      } else {
        setLoading(false)
      }
    })

    // 2. Escuta mudanças de auth (login, logout, confirmação de email)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Evita chamada dupla com getSession
          if (!profileLoading.current) {
            await loadProfile(session.user.id, mounted)
          }
        } else {
          setProfile(null)
          setCompany(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function loadProfile(userId: string, mounted: boolean = true) {
    if (profileLoading.current) return
    profileLoading.current = true

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)

      if (!mounted) return

      if (error || !profiles || profiles.length === 0) {
        setProfile(null)
        setCompany(null)
        return
      }

      const profileData = profiles[0] as Profile
      setProfile(profileData)

      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, status, plan, trial_ends_at')
        .eq('id', profileData.company_id)

      if (!mounted) return

      if (companies && companies.length > 0) {
        setCompany(companies[0] as Company)
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    } finally {
      profileLoading.current = false
      if (mounted) setLoading(false)
    }
  }

  async function signOut() {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      setProfile(null)
      setCompany(null)
      toast.success('Sessão encerrada com sucesso')
    } catch (error) {
      console.error('Erro ao sair:', error)
      toast.error('Erro ao encerrar sessão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, company, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}