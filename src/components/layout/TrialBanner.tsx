import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

export function TrialBanner() {
  const { company } = useAuth()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || company?.status !== 'trial') return null

  const trialDaysLeft = Math.max(0, Math.ceil(
    (new Date(company.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ))

  // Só exibe banner nos últimos 7 dias
  if (trialDaysLeft > 7) return null

  return (
    <div className={`flex items-center justify-between px-6 py-2.5 text-sm font-medium
      ${trialDaysLeft <= 3 ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} />
        <span>
          Seu período de teste expira em <strong>{trialDaysLeft} dia{trialDaysLeft !== 1 ? 's' : ''}</strong>.
          {' '}Assine um plano para continuar usando o Almox.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/planos')}
          className="underline hover:no-underline"
        >
          Ver planos
        </button>
        <button onClick={() => setDismissed(true)} className="hover:opacity-75">
          <X size={15} />
        </button>
      </div>
    </div>
  )
}