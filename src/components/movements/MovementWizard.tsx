import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MovementWizardStep1 } from './MovementWizardStep1'
import { MovementWizardStep2 } from './MovementWizardStep2'
import { MovementWizardStep3 } from './MovementWizardStep3'
import { useMovements, MovementFormData } from '@/hooks/useMovements'
import { useAuth } from '@/contexts/AuthContext'
import { Warehouse } from '@/hooks/useWarehouses'
import { Project } from '@/hooks/useProjects'
import { Product } from '@/hooks/useProducts'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const PROJECT_REQUIRED_TYPES = ["saida", "transferencia", "retorno"]

const schema = z.object({
  type: z.enum(["entrada", "saida", "transferencia", "ajuste", "inventario", "retorno"]),
  warehouse_id: z.string().min(1, "Almoxarifado obrigatorio"),
  warehouse_dest_id: z.string().nullable().optional(),
  project_id: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  occurred_at: z.string().min(1, "Data obrigatoria"),
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().positive(),
    unit_cost: z.number().nullable().optional(),
    notes: z.string().nullable().optional(),
    product: z.object({
      name: z.string(),
      unit: z.string(),
      sku: z.string().nullable(),
    }).optional(),
    current_stock: z.number().optional(),
  })).min(1, "Adicione pelo menos um produto"),
}).refine(data => {
  if (PROJECT_REQUIRED_TYPES.includes(data.type) && !data.project_id) return false
  return true
}, { message: "Projeto obrigatorio para este tipo", path: ["project_id"] })
.refine(data => {
  if (data.type === "transferencia" && !data.warehouse_dest_id) return false
  return true
}, { message: "Almoxarifado de destino obrigatorio", path: ["warehouse_dest_id"] })

interface MovementWizardProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  warehouses: Warehouse[]
  projects: Project[]
  products: Product[]
  stockMap: Record<string, number>
}

const STEPS = ["Tipo e Local", "Produtos", "Revisao"]

export function MovementWizard({
  open, onClose, onSuccess,
  warehouses, projects, products, stockMap
}: MovementWizardProps) {
  const { profile } = useAuth()
  const { createMovement } = useMovements()
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const isManager = ["manager", "owner", "super_admin"].includes(profile?.role || "")

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "entrada",
      warehouse_id: "",
      warehouse_dest_id: null,
      project_id: null,
      notes: null,
      occurred_at: new Date().toISOString().slice(0, 16),
      items: [],
    },
  })

  function handleClose() {
    form.reset()
    setCurrentStep(0)
    onClose()
  }

  async function handleNext() {
    let fieldsToValidate: string[] = []
    if (currentStep === 0) {
      fieldsToValidate = ["type", "warehouse_id", "occurred_at", "project_id"]
      if (form.watch("type") === "transferencia") {
        fieldsToValidate.push("warehouse_dest_id")
      }
    } else if (currentStep === 1) {
      fieldsToValidate = ["items"]
    }
    const valid = await form.trigger(fieldsToValidate as any)
    if (valid) setCurrentStep(s => s + 1)
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const values = form.getValues()
      const data: MovementFormData = {
        type: values.type,
        warehouse_id: values.warehouse_id,
        warehouse_dest_id: values.warehouse_dest_id || null,
        project_id: values.project_id || null,
        notes: values.notes || null,
        occurred_at: new Date(values.occurred_at).toISOString(),
        items: values.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost || null,
          notes: item.notes || null,
        })),
      }
      const result = await createMovement(data)
      if (result) {
        handleClose()
        onSuccess()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Movimentacao</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                i < currentStep ? "bg-blue-800 text-white" :
                i === currentStep ? "bg-blue-800 text-white" :
                "bg-slate-200 text-slate-500"
              )}>
                {i < currentStep ? <Check size={14} /> : i + 1}
              </div>
              <span className={cn("text-xs hidden sm:block",
                i === currentStep ? "text-blue-800 font-medium" : "text-slate-400")}>
                {step}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn("flex-1 h-0.5",
                  i < currentStep ? "bg-blue-800" : "bg-slate-200")} />
              )}
            </div>
          ))}
        </div>

        <div className="py-2">
          {currentStep === 0 && (
            <MovementWizardStep1
              form={form}
              warehouses={warehouses}
              projects={projects}
            />
          )}
          {currentStep === 1 && (
            <MovementWizardStep2
              form={form}
              products={products}
              stockMap={stockMap}
            />
          )}
          {currentStep === 2 && (
            <MovementWizardStep3
              form={form}
              warehouses={warehouses}
              projects={projects}
              isManager={isManager}
            />
          )}
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline"
            onClick={currentStep === 0 ? handleClose : () => setCurrentStep(s => s - 1)}>
            {currentStep === 0 ? "Cancelar" : "Voltar"}
          </Button>
          <div className="flex-1" />
          {currentStep < STEPS.length - 1 ? (
            <Button type="button" className="bg-blue-800 hover:bg-blue-900"
              onClick={handleNext}>
              Proximo
            </Button>
          ) : (
            <Button type="button" className="bg-blue-800 hover:bg-blue-900"
              onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Salvando..." : "Confirmar movimentacao"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
