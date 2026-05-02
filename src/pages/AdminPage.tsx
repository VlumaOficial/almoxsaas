import { useState } from 'react'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { ShieldCheck, Globe, CreditCard, Building2, Plus, Trash2 } from 'lucide-react'

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

const FEATURE_GROUPS: Record<string, string[]> = {
  'Produtos': ['product_images', 'product_barcode', 'product_price_history'],
  'Movimentações': ['movement_multi_approval', 'movement_attachments', 'movement_digital_sign', 'movement_batch_tracking', 'movement_return'],
  'Relatórios': ['export_excel_pdf', 'advanced_reports', 'analytics_dashboard', 'scheduled_reports'],
  'Usuários': ['two_factor_auth', 'audit_log', 'ip_restriction'],
  'Almoxarifados': ['multiple_warehouses', 'shelf_addressing', 'cyclic_inventory'],
  'Integrações': ['public_api', 'webhooks', 'erp_integration', 'whatsapp_notifications', 'nfe_integration'],
  'Experiência': ['mobile_pwa', 'barcode_scanner', 'push_notifications'],
}

export default function AdminPage() {
  const {
    globalFlags, planFlags, companyFlags, loading,
    updateGlobalFlag, updatePlanFlag, setCompanyFlag, removeCompanyFlag
  } = useFeatureFlags()

  const [companyOverrideModal, setCompanyOverrideModal] = useState(false)
  const [overrideForm, setOverrideForm] = useState({
    feature: '', company_id: '', enabled: true, notes: ''
  })

  function getGlobalFlag(feature: string) {
    return globalFlags.find(f => f.feature === feature)
  }

  function getPlanFlag(feature: string, plan: string) {
    return planFlags.find(f => f.feature === feature && f.plan === plan)
  }

  async function handleCompanyOverride() {
    await setCompanyFlag(
      overrideForm.feature,
      overrideForm.company_id,
      overrideForm.enabled,
      overrideForm.notes
    )
    setCompanyOverrideModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <ShieldCheck size={24} className="text-blue-800" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Administração Global</h2>
          <p className="text-slate-500 text-sm">Controle de features, planos e empresas</p>
        </div>
      </div>

      <Tabs defaultValue="global">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe size={14} /> Global
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <CreditCard size={14} /> Por Plano
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 size={14} /> Por Empresa
          </TabsTrigger>
        </TabsList>

        {/* ABA GLOBAL */}
        <TabsContent value="global" className="space-y-4 mt-4">
          <p className="text-sm text-slate-500">
            Configurações globais afetam <strong>todas as empresas</strong> da plataforma,
            independente do plano contratado.
          </p>
          {Object.entries(FEATURE_GROUPS).map(([group, features]) => (
            <div key={group} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700 text-sm">{group}</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center w-24">Habilitado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map(feature => {
                    const flag = getGlobalFlag(feature)
                    return (
                      <TableRow key={feature}>
                        <TableCell className="font-mono text-xs text-slate-600">{feature}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{flag?.description || '-'}</TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={flag?.enabled || false}
                            onCheckedChange={(val) => updateGlobalFlag(feature, val)}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ))}
        </TabsContent>

        {/* ABA POR PLANO */}
        <TabsContent value="plan" className="space-y-4 mt-4">
          <p className="text-sm text-slate-500">
            Configurações por plano definem o que cada assinatura inclui por padrão.
          </p>
          {Object.entries(FEATURE_GROUPS).map(([group, features]) => (
            <div key={group} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700 text-sm">{group}</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    {['starter', 'professional', 'enterprise'].map(plan => (
                      <TableHead key={plan} className="text-center">
                        {PLAN_LABELS[plan]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map(feature => (
                    <TableRow key={feature}>
                      <TableCell className="font-mono text-xs text-slate-600">{feature}</TableCell>
                      {['starter', 'professional', 'enterprise'].map(plan => {
                        const flag = getPlanFlag(feature, plan)
                        return (
                          <TableCell key={plan} className="text-center">
                            <Switch
                              checked={flag?.enabled || false}
                              onCheckedChange={(val) => updatePlanFlag(feature, plan, val)}
                            />
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </TabsContent>

        {/* ABA POR EMPRESA */}
        <TabsContent value="company" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Overrides por empresa <strong>sobrescrevem</strong> as regras de plano e global.
              Use para liberar features como add-ons comerciais.
            </p>
            <Button
              onClick={() => setCompanyOverrideModal(true)}
              className="bg-blue-800 hover:bg-blue-900"
              size="sm"
            >
              <Plus size={14} className="mr-1" /> Novo override
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {companyFlags.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">
                Nenhum override por empresa configurado ainda
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyFlags.map(flag => (
                    <TableRow key={flag.id}>
                      <TableCell className="font-medium text-slate-900">
                        {flag.company?.name || flag.company_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {PLAN_LABELS[flag.company?.plan || ''] || flag.company?.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {flag.feature}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {flag.notes || <span className="text-slate-300">—</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={(val) =>
                            setCompanyFlag(flag.feature, flag.company_id, val, flag.notes || undefined)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost" size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeCompanyFlag(flag.feature, flag.company_id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de novo override por empresa */}
      <Dialog open={companyOverrideModal} onOpenChange={setCompanyOverrideModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo override por empresa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">ID da Empresa</label>
              <Input
                placeholder="UUID da empresa"
                value={overrideForm.company_id}
                onChange={e => setOverrideForm(f => ({ ...f, company_id: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Feature</label>
              <Input
                placeholder="Ex: product_images"
                value={overrideForm.feature}
                onChange={e => setOverrideForm(f => ({ ...f, feature: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Observação (opcional)</label>
              <Input
                placeholder="Ex: Liberado como add-on - Contrato #123"
                value={overrideForm.notes}
                onChange={e => setOverrideForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Feature habilitada</span>
              <Switch
                checked={overrideForm.enabled}
                onCheckedChange={val => setOverrideForm(f => ({ ...f, enabled: val }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompanyOverrideModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCompanyOverride}
              className="bg-blue-800 hover:bg-blue-900"
              disabled={!overrideForm.feature || !overrideForm.company_id}
            >
              Salvar override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
