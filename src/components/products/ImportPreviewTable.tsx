import { ImportRow } from '@/hooks/useProductImport'
import { CheckCircle, XCircle } from 'lucide-react'

interface ImportPreviewTableProps {
  rows: ImportRow[]
}

export function ImportPreviewTable({ rows }: ImportPreviewTableProps) {
  return (
    <div className="overflow-auto max-h-80 rounded-lg border border-slate-200">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-slate-50">
          <tr className="border-b border-slate-200">
            <th className="text-left px-3 py-2 font-medium text-slate-500 whitespace-nowrap">Linha</th>
            <th className="text-left px-3 py-2 font-medium text-slate-500 whitespace-nowrap">SKU</th>
            <th className="text-left px-3 py-2 font-medium text-slate-500 whitespace-nowrap">Nome</th>
            <th className="text-left px-3 py-2 font-medium text-slate-500 whitespace-nowrap">Categoria</th>
            <th className="text-left px-3 py-2 font-medium text-slate-500 whitespace-nowrap">Un.</th>
            <th className="text-right px-3 py-2 font-medium text-slate-500 whitespace-nowrap">Est. Mín.</th>
            <th className="text-right px-3 py-2 font-medium text-slate-500 whitespace-nowrap">Est. Inicial</th>
            <th className="text-left px-3 py-2 font-medium text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.linha}
              className={`border-b border-slate-100 last:border-0
                ${row.status === 'erro' ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
              <td className="px-3 py-2 text-slate-500">{row.linha}</td>
              <td className="px-3 py-2 font-mono text-slate-700">{row.codigo || '—'}</td>
              <td className="px-3 py-2 text-slate-700 max-w-32 truncate">{row.nome || '—'}</td>
              <td className="px-3 py-2 text-slate-500 max-w-28 truncate">{row.categoria || '—'}</td>
              <td className="px-3 py-2 text-slate-500">{row.unidade || '—'}</td>
              <td className="px-3 py-2 text-right text-slate-600">{row.estoque_minimo}</td>
              <td className="px-3 py-2 text-right text-slate-600">{row.estoque_inicial}</td>
              <td className="px-3 py-2">
                {row.status === 'valido' ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={12} /> Válido
                  </span>
                ) : (
                  <div className="space-y-0.5">
                    {row.erros.map((e, i) => (
                      <span key={i} className="flex items-start gap-1 text-red-600">
                        <XCircle size={12} className="mt-0.5 shrink-0" />
                        <span>{e}</span>
                      </span>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
