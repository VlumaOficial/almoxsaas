import { Logo } from '../components/auth/Logo'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'
import { Check, Rocket, Shield, Zap } from 'lucide-react'

export default function PlanosPage() {
  const { signOut, company } = useAuth()

  const plans = [
    {
      name: 'Starter',
      price: 'R$ 49',
      description: 'Ideal para pequenos negócios',
      features: ['Até 50 produtos', '1 usuário', '100 movimentações/mês'],
      icon: <Zap className="text-blue-600" />,
    },
    {
      name: 'Professional',
      price: 'R$ 99',
      description: 'Para empresas em crescimento',
      features: ['Até 500 produtos', '3 usuários', '1.000 movimentações/mês'],
      icon: <Rocket className="text-blue-600" />,
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Sob consulta',
      description: 'Controle total e ilimitado',
      features: ['Produtos ilimitados', 'Usuários ilimitados', 'Movimentações ilimitadas'],
      icon: <Shield className="text-blue-600" />,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <Logo size="lg" />
          <h1 className="text-3xl font-bold text-slate-900 mt-8">
            {company?.status === 'trial' ? 'Seu período de teste expirou' : 'Escolha o plano ideal para sua empresa'}
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Continue gerenciando seu estoque com a melhor ferramenta do mercado. 
            Selecione um plano abaixo para reativar seu acesso.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`bg-white rounded-2xl border p-8 shadow-sm flex flex-col ${
                plan.popular ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full self-start mb-4">
                  Mais popular
                </span>
              )}
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                {plan.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                {plan.price !== 'Sob consulta' && <span className="text-slate-500">/mês</span>}
              </div>
              <p className="text-slate-500 text-sm mt-2 mb-6">{plan.description}</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-600">
                    <Check size={16} className="text-green-600 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
                Assinar agora
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={signOut}
            className="text-slate-500 hover:text-slate-800 text-sm font-medium underline underline-offset-4"
          >
            Sair da conta e voltar depois
          </button>
        </div>
      </div>
    </div>
  )
}