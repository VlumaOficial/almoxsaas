import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Project, ProjectFormData, ProjectStatus } from '@/hooks/useProjects'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList
} from '@/components/ui/command'
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover'
import { ChevronsUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'planejamento', label: 'Planejamento' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'pausado',      label: 'Pausado' },
  { value: 'concluido',    label: 'Concluído' },
  { value: 'cancelado',    label: 'Cancelado' },
]

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().nullable().optional(),
  responsible_id: z.string().nullable().optional(),
  status: z.enum(['planejamento', 'em_andamento', 'pausado', 'concluido', 'cancelado']),
  started_at: z.string().nullable().optional(),
  ended_at: z.string().nullable().optional(),
})

type FormData = z.infer<typeof schema>

interface ProjectDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ProjectFormData) => Promise<boolean>
  project?: Project | null
  profiles: { id: string; full_name: string }[]
}

export function ProjectDrawer({
  open, onClose, onSubmit, project, profiles
}: ProjectDrawerProps) {
  const isEditing = !!project
  const [responsibleOpen, setResponsibleOpen] = useState(false)

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'planejamento' },
  })

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,