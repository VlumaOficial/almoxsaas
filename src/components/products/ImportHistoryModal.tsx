import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { History } from 'lucide-react'

interface ImportHistoryModalProps {
  open: boolean
  onClose: () => void
}

interface ImportRecord {
  id: string
  filename: string
  total_rows: number
  imported: number
  ignored: number
  errors: number
  created_at: string
  imported_by_profile?: { full_name: string }
}

export function ImportHistoryModal({ open, onClose }: ImportHistoryModalProps) {
  const { company } = useAuth()
  const [records, setRecords] = useState<ImportRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open || !company?.id) return

    supabase
      .from('product_imports')
      .select('*, imported_by_profile:profiles!product_imports_imported_by_fkey(full_name)')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setRecords((data || []) as ImportRecord[])
        setLoading(false)
      })
  }, [open, company?.id])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History size={18} /> Histórico de Importações
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Carregando...</div>
        ) : records.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Nenhuma importação realizada ainda
          </div>
        ) : (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-2 font-medium text-slate-500 whitespace-nowrap">Data</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-500">Usuário</th>
                  <th className="text-center px-4 py-2 font-medium text-slate-500">Total</th>
                  <th className="text-center px-4 py-2 font-medium text-slate-500">Importados</th>
                  <th className="text-center px-4 py-2 font-medium text-slate-500">Ignorados</th>
                  <th className="text-center px-4 py-2 font-medium text-slate-500">Erros</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-500 whitespace-nowrap">
                      {format(new Date(r.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {(r.imported_by_profile as any)?.full_name || '—'}
                    </td>
                    <td className="px-4 py-2 text-center text-slate-600">{r.total_rows}</td>
                    <td className="px-4 py-2 text-center">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        {r.imported}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Badge variant="secondary">{r.ignored}</Badge>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {r.errors > 0 ? (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                          {r.errors}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">0</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
