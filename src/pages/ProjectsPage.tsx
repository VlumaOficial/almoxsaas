import { useState, useMemo } from 'react'
import { useProjects, Project } from '@/hooks/useProjects'
import { useProfiles } from '@/hooks/useProfiles'
import { ProjectDrawer } from '@/components/projects/ProjectDrawer'
import { ProjectTable } from '@/components/projects/ProjectTable'
import { ProjectFilters } from '@/components/projects/ProjectFilters'
import { ProjectDetailsModal } from '@/components/projects/ProjectDetailsModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function ProjectsPage() {
  const {
    projects, loading,
    createProject, updateProject, deleteProject
  } = useProjects()

  const { profiles } = useProfiles()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [detailsProject, setDetailsProject] = useState<Project | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  function handleEdit(project: Project) {
    setEditingProject(project)
    setDrawerOpen(true)
  }

  function handleClose() {
    setDrawerOpen(false)
    setEditingProject(null)
  }

  async function handleSubmit(data: any) {
    if (editingProject) return updateProject(editingProject.id, data)
    return createProject(data)
  }

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [projects, search, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Projetos</h2>
          <p className="text-slate-500 text-sm mt-1">
            {projects.length} projeto{projects.length !== 1 ? 's' : ''} cadastrado{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setDrawerOpen(true)} className="bg-blue-800 hover:bg-blue-900">
          <Plus size={16} className="mr-2" /> Novo projeto
        </Button>
      </div>

      <ProjectFilters
        search={search}
        onSearchChange={(v) => setSearch(v)}
        statusFilter={statusFilter}
        onStatusChange={(v) => setStatusFilter(v)}
      />

      <ProjectTable
        projects={filteredProjects}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteProject}
        onViewDetails={(p) => setDetailsProject(p)}
      />

      <ProjectDrawer
        open={drawerOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        project={editingProject}
        profiles={profiles}
      />

      <ProjectDetailsModal
        open={!!detailsProject}
        onClose={() => setDetailsProject(null)}
        project={detailsProject}
      />
    </div>
  )
}
