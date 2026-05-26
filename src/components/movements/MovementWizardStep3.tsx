import { UseFormReturn } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Warehouse } from '@/hooks/useWarehouses'
import { Project } from '@/hooks/useProjects'

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  entrada:       { label: "Entrada",       color: "bg-green-100 text-green-700" },
  saida:         { label: "Saida",         color: "bg-red-100 text-red-700" },
  transferencia: { label: "Transferencia", color: "bg-blue-100 text-blue-700" },
  ajuste:        { label: "Ajuste",        color: "bg-amber-100 text-amber-700" },
  inventario:    { label: "Inventario",    color: "bg-purple-100 text-purple-700" },
  retorno:       { label: "Retorno",       color: "bg-slate-100 text-slate-700" },
}

interface Step3Props {
  form: UseFormReturn<any>
  warehouses: Warehouse[]
  projects: Project[]
  isManager: boolean
}

export function MovementWizardStep3({ form, warehouses, projects, isManager }: Step3Props) {
  const { watch } = form
  const type = watch("type")
  const items = watch("items") || []
  const typeConf = TYPE_LABELS[type] || { label: type, color: "bg-slate-100 text-slate-700" }
  const warehouse = warehouses.find(w => w.id === watch("warehouse_id"))
  const warehouseDest = warehouses.find(w => w.id === watch("warehouse_dest_id"))
  const project = projects.find(p => p.id === watch("project_id"))

  const totalCost = items.reduce((acc: number, item: any) => {
    return acc + (item.quantity * (item.unit_cost || 0))
  }, 0)

  return (
    <div className="space-y-5">
      <div className="bg-slate-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Tipo</span>
          <Badge className={typeConf.color}>{typeConf.label}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Almoxarifado</span>
          <span className="text-sm font-medium text-slate-900">{warehouse?.name || "-"}</span>
        </div>
        {warehouseDest && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Destino</span>
            <span className="text-sm font-medium text-slate-900">{warehouseDest.name}</span>
          </div>
        )}
        {project && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Projeto</span>
            <span className="text-sm font-medium text-slate-900">{project.name}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Data</span>
          <span className="text-sm font-medium text-slate-900">
            {watch("occurred_at")
              ? format(new Date(watch("occurred_at")), "dd/MM/yyyy HH:mm", { locale: ptBR })
              : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Status apos salvar</span>
          <Badge className={isManager ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
            {isManager ? "Aprovado automaticamente" : "Pendente de aprovacao"}
          </Badge>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-900 mb-2">
          Itens ({items.length})
        </p>
        <div className="space-y-1">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm text-slate-900">{item.product?.name}</p>
                {item.product?.sku && (
                  <p className="text-xs text-slate-400">{item.product.sku}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {item.quantity} {item.product?.unit}
                </p>
                {item.unit_cost && (
                  <p className="text-xs text-slate-400">
                    {(item.quantity * item.unit_cost).toLocaleString("pt-BR",
                      { style: "currency", currency: "BRL" })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        {totalCost > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-2">
            <span className="text-sm font-medium text-slate-700">Custo total</span>
            <span className="text-sm font-bold text-slate-900">
              {totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
        )}
      </div>

      {watch("notes") && (
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Observacoes</p>
          <p className="text-sm text-slate-700">{watch("notes")}</p>
        </div>
      )}
    </div>
  )
}
