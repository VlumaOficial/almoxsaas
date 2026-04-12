import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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

  useEffect(() => {
    // Sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (session?.user) await loadProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          setCompany(null)
          setLoading(false)
        } else {
          // Para outros eventos (TOKEN_REFRESHED, USER_UPDATED, etc.)
          // garantir que loading seja desativado
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)

      if (profileError || !profiles || profiles.length === 0) {
        setProfile(null)
        setCompany(null)
        return
      }

      const profileData = profiles[0]
      setProfile(profileData)

      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id, name, status, plan, trial_ends_at')
        .eq('id', profileData.company_id)

      if (!companyError && companies && companies.length > 0) {
        setCompany(companies[0])
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      // Limpeza manual garantida
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