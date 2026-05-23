import { useState } from 'react'
import { Project } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, FolderOpen, Eye } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  planejamento: { label: 'Planejamento', color: 'bg-slate-100 text-slate-600' },
  em_andamento: { label: 'Em andamento', color: 'bg-blue-100 text-blue-700' },
  pausado:      { label: 'Pausado',      color: 'bg-amber-100 text-amber-700' },
  concluido:    { label: 'Concluído',    color: 'bg-green-100 text-green-700' },
  cancelado:    { label: 'Cancelado',    color: 'bg-red-100 text-red-700' },
}

interface ProjectTableProps {
  projects: Project[]
  loading: boolean
  onEdit: (project: Project) => void
  onDelete: (id: string) => Promise<boolean>
  onViewDetails: (project: Project) => void
}

export function ProjectTable({
  projects, loading, onEdit, onDelete, onViewDetails
}: ProjectTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await onDelete(deleteId)
    setDeleting(false)
    setDeleteId(null)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />)}
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhum projeto encontrado</p>
            <p className="text-slate-400 text-sm mt-1">
              Crie um projeto para rastrear materiais e equipamentos
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Projeto</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Responsável</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Início</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Encerramento</th>
                  <th className="text-center px-5 py-3 font-medium text-slate-500 whitespace-nowrap">Movimentações</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => {
                  const statusConf = STATUS_CONFIG[project.status]
                  return (
                    <tr key={project.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{project.name}</p>
                        {project.description && (
                          <p className="text-xs text-slate-400 truncate max-w-xs">
                            {project.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Badge className={statusConf.color}>{statusConf.label}</Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {project.responsible
                          ? (project.responsible as any).full_name
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                        {project.started_at
                          ? format(new Date(project.started_at), "dd/MM/yyyy", { locale: ptBR })
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                        {project.ended_at
                          ? format(new Date(project.ended_at), "dd/MM/yyyy", { locale: ptBR })
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Badge variant="outline">
                          {(project as any).movements_count?.[0]?.count || 0}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm"
                            onClick={() => onViewDetails(project)}
                            title="Ver detalhes">
                            <Eye size={14} />
                          </Button>
                          <Button variant="ghost" size="sm"
                            onClick={() => onEdit(project)}>
                            <Pencil size={14} />
                          </Button>
                          <Button variant="ghost" size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteId(project.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Projetos com movimentações
              vinculadas não podem ser excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="bg-red-600 hover:bg-red-700">
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
