import { useEffect, useState } from 'react'
import { useProjects, Project, ProjectStats } from '@/hooks/useProjects'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowUpCircle, ArrowDownCircle,
  DollarSign, TrendingDown
} from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  planejamento: { label: 'Planejamento', color: 'bg-slate-100 text-slate-600' },
  em_andamento: { label: 'Em andamento', color: 'bg-blue-100 text-blue-700' },
  pausado:      { label: 'Pausado',      color: 'bg-amber-100 text-amber-700' },
  concluido:    { label: 'Concluído',    color: 'bg-green-100 text-green-700' },
  cancelado:    { label: 'Cancelado',    color: 'bg-red-100 text-red-700' },
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  entrada:         { label: 'Entrada',       color: 'text-green-600 bg-green-50' },
  saida:           { label: 'Saída',         color: 'text-red-600 bg-red-50' },
  transferencia:   { label: 'Transferência', color: 'text-blue-600 bg-blue-50' },
  movement_return: { label: 'Devolução',     color: 'text-purple-600 bg-purple-50' },
  inventario:      { label: 'Inventário',    color: 'text-slate-600 bg-slate-50' },
  ajuste:          { label: 'Ajuste',        color: 'text-amber-600 bg-amber-50' },
}

interface ProjectDetailsModalProps {
  open: boolean
  onClose: () => void
  project: Project | null
}

export function ProjectDetailsModal({ open, onClose, project }: ProjectDetailsModalProps) {
  const { fetchProjectStats } = useProjects()
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !project) return
    setLoading(true)
    fetchProjectStats(project.id).then(data => {
      setStats(data)
      setLoading(false)
    })
  }, [open, project?.id])

  if (!project) return null

  const statusConf = STATUS_CONFIG[project.status]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {project.name}
            <Badge className={statusConf.color}>{statusConf.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        {project.description && (
          <p className="text-slate-500 text-sm">{project.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          {project.responsible && (
            <span>👤 Responsável: <strong className="text-slate-700">
              {(project.responsible as any).full_name}
            </strong></span>
          )}
          {project.started_at && (
            <span>📅 Início: <strong className="text-slate-700">
              {format(new Date(project.started_at), "dd/MM/yyyy", { locale: ptBR })}
            </strong></span>
          )}
          {project.ended_at && (
            <span>🏁 Encerramento: <strong className="text-slate-700">
              {format(new Date(project.ended_at), "dd/MM/yyyy", { locale: ptBR })}
            </strong></span>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Carregando estatísticas...
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <ArrowUpCircle size={18} className="text-red-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-red-700">{stats.total_saidas}</p>
                <p className="text-xs text-red-500">Total saído</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <ArrowDownCircle size={18} className="text-purple-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-purple-700">{stats.total_devolvido}</p>
                <p className="text-xs text-purple-500">Total devolvido</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <TrendingDown size={18} className="text-amber-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-amber-700">{stats.saldo_campo}</p>
                <p className="text-xs text-amber-500">Saldo em campo</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <DollarSign size={18} className="text-green-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-green-700">
                  {stats.custo_total.toLocaleString('pt-BR', {
                    style: 'currency', currency: 'BRL'
                  })}
                </p>
                <p className="text-xs text-green-500">Custo total</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 text-sm mb-3">
                Histórico de Movimentações
              </h3>
              {stats.movements.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-sm">
                  Nenhuma movimentação aprovada neste projeto
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.movements.map(mov => {
                    const typeConf = TYPE_CONFIG[mov.type] ||
                      { label: mov.type, color: 'text-slate-600 bg-slate-50' }
                    return (
                      <div key={mov.id}
                        className="border border-slate-100 rounded-lg p-3 hover:bg-slate-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeConf.color}`}>
                            {typeConf.label}
                          </span>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">
                              {format(new Date(mov.occurred_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                            {mov.requested_by_name && (
                              <p className="text-xs text-slate-400">{mov.requested_by_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {mov.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-slate-700">{item.product_name}</span>
                              <span className="text-slate-500">
                                {item.quantity} {item.unit}
                                {item.unit_cost && (
                                  <span className="text-slate-400 ml-2">
                                    ({(item.quantity * item.unit_cost).toLocaleString('pt-BR',
                                      { style: 'currency', currency: 'BRL' })})
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-slate-400 text-sm">
            Nenhuma estatística disponível
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}