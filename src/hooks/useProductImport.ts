import { useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const VALID_UNITS = ['un', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'cx', 'pç', 'par', 'rolo', 'pacote']

const PLAN_LIMITS: Record<string, number> = {
  starter: 50,
  professional: 500,
  enterprise: Infinity,
}

export interface ImportRow {
  linha: number
  codigo: string
  nome: string
  unidade: string
  categoria: string
  estoque_minimo: number
  estoque_inicial: number
  descricao?: string
  fornecedor?: string
  preco_custo?: number | null
  status: 'valido' | 'erro' | 'ignorado'
  erros: string[]
}

export interface ImportSummary {
  total: number
  validos: number
  erros: number
  quotaLimit: number | null
  quotaAvailable: number | null
  willImport: number
}

export function useProductImport() {
  const { company, profile } = useAuth()
  const [rows, setRows] = useState<ImportRow[]>([])
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    imported: number
    errors: number
    errorDetails: { linha: number; codigo: string; erro: string }[]
  } | null>(null)

  function downloadTemplate() {
    const headers = [
      'codigo', 'nome', 'unidade', 'categoria', 'estoque_minimo',
      'estoque_inicial', 'descricao', 'fornecedor', 'preco_custo'
    ]

    const example = [
      'PRD-001', 'Resma de Papel A4', 'un', 'Materiais de Escritório',
      '10', '50', 'Papel sulfite A4 75g 500 folhas', 'Distribuidora ABC', '25,90'
    ]

    const instructions = [
      '* Obrigatório', '* Obrigatório', '* Obrigatório (un/kg/g/l/ml/m/cm/cx/pç/par)',
      '* Obrigatório (cria se não existir)', '* Obrigatório (mínimo 0)',
      '* Obrigatório (mínimo 0)', 'Opcional', 'Opcional (ignora se não encontrado)',
      'Opcional (use vírgula ou ponto decimal)'
    ]

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers, instructions, example])
    ws['!cols'] = headers.map(() => ({ wch: 25 }))
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos')

    const wsInfo = XLSX.utils.aoa_to_sheet([
      ['INSTRUÇÕES DE PREENCHIMENTO'],
      [''],
      ['1. Não altere os cabeçalhos da primeira linha'],
      ['2. A linha 2 contém instruções — apague antes de enviar'],
      ['3. Campos com * são obrigatórios'],
      ['4. Unidades válidas: un, kg, g, l, ml, m, cm, cx, pç, par, rolo, pacote'],
      ['5. Categoria: será criada automaticamente se não existir'],
      ['6. Fornecedor: será ignorado se não encontrado no sistema'],
      ['7. Preço de custo: use vírgula ou ponto como separador decimal'],
      ['8. SKU/Código: deve ser único — não pode repetir no arquivo nem no sistema'],
    ])
    wsInfo['!cols'] = [{ wch: 60 }]
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Instruções')

    XLSX.writeFile(wb, 'modelo_importacao_produtos.xlsx')
  }

  async function processFile(file: File): Promise<void> {
    if (!company?.id) return

    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
        header: 1, defval: ''
      }) as any[][]

      if (rawData.length < 2) {
        toast.error('Arquivo vazio ou sem dados')
        return
      }

      const dataRows = rawData.slice(1).filter(row =>
        row.some(cell => String(cell).trim() !== '')
      )

      const { data: existingProducts } = await supabase
        .from('products')
        .select('sku')
        .eq('company_id', company.id)

      const existingSkus = new Set(
        (existingProducts || []).map(p => p.sku?.toLowerCase())
      )

      const { count: currentCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('is_active', true)

      const planLimit = PLAN_LIMITS[company.plan] || 50
      const available = planLimit === Infinity
        ? Infinity
        : Math.max(0, planLimit - (currentCount || 0))

      const skusNoArquivo = new Set<string>()
      const processedRows: ImportRow[] = []

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i]
        const erros: string[] = []

        const codigo = String(row[0] || '').trim()
        const nome = String(row[1] || '').trim()
        const unidade = String(row[2] || '').trim().toLowerCase()
        const categoria = String(row[3] || '').trim()
        const estoque_minimo = parseFloat(String(row[4] || '0').replace(',', '.'))
        const estoque_inicial = parseFloat(String(row[5] || '0').replace(',', '.'))
        const descricao = String(row[6] || '').trim() || undefined
        const fornecedor = String(row[7] || '').trim() || undefined
        const precoCustoRaw = String(row[8] || '').trim()
        const preco_custo = precoCustoRaw
          ? parseFloat(precoCustoRaw.replace(',', '.'))
          : null

        if (!codigo) erros.push('Código/SKU obrigatório')
        if (codigo && skusNoArquivo.has(codigo.toLowerCase()))
          erros.push('SKU duplicado no arquivo')
        if (codigo && existingSkus.has(codigo.toLowerCase()))
          erros.push('SKU já existe no sistema')
        if (!nome) erros.push('Nome obrigatório')
        if (!unidade) erros.push('Unidade obrigatória')
        if (unidade && !VALID_UNITS.includes(unidade))
          erros.push(`Unidade inválida: "${unidade}". Use: ${VALID_UNITS.join(', ')}`)
        if (!categoria) erros.push('Categoria obrigatória')
        if (isNaN(estoque_minimo) || estoque_minimo < 0)
          erros.push('Estoque mínimo inválido (mínimo 0)')
        if (isNaN(estoque_inicial) || estoque_inicial < 0)
          erros.push('Estoque inicial inválido (mínimo 0)')
        if (precoCustoRaw && isNaN(preco_custo!))
          erros.push('Preço de custo inválido')

        if (codigo) skusNoArquivo.add(codigo.toLowerCase())

        processedRows.push({
          linha: i + 2,
          codigo, nome, unidade, categoria,
          estoque_minimo: isNaN(estoque_minimo) ? 0 : estoque_minimo,
          estoque_inicial: isNaN(estoque_inicial) ? 0 : estoque_inicial,
          descricao, fornecedor,
          preco_custo: isNaN(preco_custo!) ? null : preco_custo,
          status: erros.length > 0 ? 'erro' : 'valido',
          erros,
        })
      }

      const validos = processedRows.filter(r => r.status === 'valido').length
      const willImport = planLimit === Infinity
        ? validos
        : Math.min(validos, available)

      setRows(processedRows)
      setSummary({
        total: processedRows.length,
        validos,
        erros: processedRows.filter(r => r.status === 'erro').length,
        quotaLimit: planLimit === Infinity ? null : planLimit,
        quotaAvailable: planLimit === Infinity ? null : available,
        willImport,
      })

    } catch (err) {
      toast.error('Erro ao processar arquivo. Verifique se é um arquivo Excel válido.')
    }
  }

  async function executeImport(): Promise<boolean> {
    if (!company?.id || !profile?.id || !summary) return false
    setImporting(true)

    const validRows = rows
      .filter(r => r.status === 'valido')
      .slice(0, summary.willImport)

    const errorDetails: { linha: number; codigo: string; erro: string }[] = []
    let importedCount = 0

    try {
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('company_id', company.id)

      const categoryMap = new Map(
        (existingCategories || []).map(c => [c.name.toLowerCase(), c.id])
      )

      const { data: existingSuppliers } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('company_id', company.id)

      const supplierMap = new Map(
        (existingSuppliers || []).map(s => [s.name.toLowerCase(), s.id])
      )

      for (const row of validRows) {
        try {
          let categoryId: string | null = null
          const catKey = row.categoria.toLowerCase()

          if (categoryMap.has(catKey)) {
            categoryId = categoryMap.get(catKey)!
          } else {
            const { data: newCat } = await supabase
              .from('categories')
              .insert({ company_id: company.id, name: row.categoria, is_active: true })
              .select('id')
              .single()

            if (newCat) {
              categoryId = newCat.id
              categoryMap.set(catKey, newCat.id)
            }
          }

          let supplierId: string | null = null
          if (row.fornecedor) {
            const supKey = row.fornecedor.toLowerCase()
            supplierId = supplierMap.get(supKey) || null
          }

          const { error: productError } = await supabase
            .from('products')
            .insert({
              company_id: company.id,
              sku: row.codigo,
              name: row.nome,
              unit: row.unidade,
              category_id: categoryId,
              supplier_id: supplierId,
              min_stock: row.estoque_minimo,
              cost_price: row.preco_custo,
              description: row.descricao || null,
              is_active: true,
              created_by: profile.id,
            })

          if (productError) throw new Error(productError.message)

          // TODO Fase 6: criar movimentação de entrada para estoque_inicial
          importedCount++
        } catch (err: any) {
          errorDetails.push({
            linha: row.linha,
            codigo: row.codigo,
            erro: err.message || 'Erro desconhecido',
          })
        }
      }

      await supabase.from('product_imports').insert({
        company_id: company.id,
        imported_by: profile.id,
        filename: 'importacao.xlsx',
        total_rows: rows.length,
        imported: importedCount,
        ignored: summary.erros,
        errors: errorDetails.length,
        error_details: errorDetails,
      })

      setImportResult({
        imported: importedCount,
        errors: errorDetails.length,
        errorDetails,
      })

      if (importedCount > 0) {
        toast.success(`${importedCount} produto(s) importado(s) com sucesso!`)
      }

      return true

    } catch (err) {
      toast.error('Erro durante a importação')
      return false
    } finally {
      setImporting(false)
    }
  }

  function reset() {
    setRows([])
    setSummary(null)
    setImportResult(null)
  }

  return {
    rows, summary, importing, importResult,
    downloadTemplate, processFile, executeImport, reset
  }
}
