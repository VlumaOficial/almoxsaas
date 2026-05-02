import { useState, useRef, useCallback } from 'react'
import { useProductImport } from '@/hooks/useProductImport'
import { ImportPreviewTable } from './ImportPreviewTable'
import { ImportHistoryModal } from './ImportHistoryModal'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload, Download, History, CheckCircle,
  XCircle, AlertTriangle, FileSpreadsheet
} from 'lucide-react'

interface ImportModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

type Step = 'upload' | 'preview' | 'result'

export function ImportModal({ open, onClose, onSuccess }: ImportModalProps) {
  const {
    rows, summary, importing, importResult,
    downloadTemplate, processFile, executeImport, reset
  } = useProductImport()

  const [step, setStep] = useState<Step>('upload')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleClose() {
    reset()
    setStep('upload')
    onClose()
  }

  async function handleFile(file: File) {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert('Por favor selecione um arquivo Excel (.xlsx ou .xls)')
      return
    }
    await processFile(file)
    setStep('preview')
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) await handleFile(file)
  }, [])

  async function handleImport() {
    const success = await executeImport()
    if (success) {
      setStep('result')
      onSuccess()
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet size={18} />
                Importar Produtos em Massa
              </DialogTitle>
              <Button variant="ghost" size="sm"
                onClick={() => setHistoryOpen(true)}
                className="text-slate-500">
                <History size={14} className="mr-1" /> Histórico
              </Button>
            </div>
          </DialogHeader>

          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-5 py-2">
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                <p className="font-medium mb-2">📋 Colunas obrigatórias:</p>
                <p className="font-mono text-xs bg-white border border-slate-200 rounded px-3 py-2">
                  codigo, nome, unidade, categoria, estoque_minimo, estoque_inicial
                </p>
                <p className="font-medium mt-3 mb-1">📋 Colunas opcionais:</p>
                <p className="font-mono text-xs bg-white border border-slate-200 rounded px-3 py-2">
                  descricao, fornecedor, preco_custo
                </p>
              </div>

              <Button variant="outline" className="w-full" onClick={downloadTemplate}>
                <Download size={16} className="mr-2" />
                Baixar Modelo Excel
              </Button>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
                  ${dragOver
                    ? 'border-blue-800 bg-blue-50'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                  }`}
              >
                <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                <p className="font-medium text-slate-700">
                  Arraste o arquivo aqui ou clique para selecionar
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Formatos aceitos: .xlsx, .xls
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW */}
          {step === 'preview' && summary && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
                  <p className="text-xs text-slate-500 mt-1">Total de linhas</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{summary.validos}</p>
                  <p className="text-xs text-green-600 mt-1">Válidos</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">{summary.erros}</p>
                  <p className="text-xs text-red-600 mt-1">Com erros</p>
                </div>
              </div>

              {summary.quotaLimit !== null && summary.willImport < summary.validos && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    Seu plano permite mais <strong>{summary.quotaAvailable}</strong> produto(s).
                    Apenas as primeiras <strong>{summary.willImport}</strong> linhas válidas
                    serão importadas. Considere fazer upgrade do plano.
                  </AlertDescription>
                </Alert>
              )}

              {summary.quotaAvailable === 0 && (
                <Alert variant="destructive">
                  <XCircle size={16} />
                  <AlertDescription>
                    Você atingiu o limite do seu plano ({summary.quotaLimit} produtos).
                    Faça upgrade para continuar importando.
                  </AlertDescription>
                </Alert>
              )}

              {rows.some(r => r.estoque_inicial > 0) && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-800 text-sm">
                    ℹ️ O estoque inicial será vinculado ao almoxarifado após a configuração
                    dos depósitos (disponível em breve).
                  </AlertDescription>
                </Alert>
              )}

              <ImportPreviewTable rows={rows} />

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1"
                  onClick={() => { reset(); setStep('upload') }}>
                  Voltar
                </Button>
                <Button
                  className="flex-1 bg-blue-800 hover:bg-blue-900"
                  disabled={summary.willImport === 0 || importing}
                  onClick={handleImport}
                >
                  {importing ? 'Importando...' : `Importar ${summary.willImport} produto(s)`}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: RESULT */}
          {step === 'result' && importResult && (
            <div className="space-y-4 py-2">
              <div className="text-center py-6">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                <h3 className="text-xl font-bold text-slate-900 mb-1">Importação Concluída!</h3>
                <p className="text-slate-500">
                  {importResult.imported} produto(s) importado(s) com sucesso
                </p>
              </div>

              {importResult.errors > 0 && (
                <Alert variant="destructive">
                  <XCircle size={16} />
                  <AlertDescription>
                    {importResult.errors} produto(s) falharam durante a importação.
                  </AlertDescription>
                </Alert>
              )}

              <Button className="w-full bg-blue-800 hover:bg-blue-900" onClick={handleClose}>
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ImportHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  )
}
