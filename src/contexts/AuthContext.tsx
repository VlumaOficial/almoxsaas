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

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        setProfile(null)
        setCompany(null)
        return
      }

      const profileData = data as Profile
      setProfile(profileData)

      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, status, plan, trial_ends_at')
        .eq('id', profileData.company_id)
        .single()

      if (companyData) setCompany(companyData as Company)

    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
      setProfile(null)
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        // Ignora INITIAL_SESSION pois getSession já tratou
        if (event === 'INITIAL_SESSION') return
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          loadProfile(session.user.id)
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

  async function signOut() {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      setProfile(null)
      setCompany(null)
      toast.success('Sessão encerrada com sucesso')
    } catch (error) {
      console.error('Erro ao sair:', error)
      toast.error('Erro ao encerrar sessão')
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