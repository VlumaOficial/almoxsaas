import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export type StockStatus = "normal" | "baixo" | "zerado"

export interface StockItem {
  product_id: string
  product_name: string
  product_sku: string | null
  product_unit: string
  category_name: string | null
  min_stock: number
  cost_price: number | null
  total_quantity: number
  total_value: number
  status: StockStatus
  warehouses: {
    warehouse_id: string
    warehouse_name: string
    quantity: number
    location: string | null
  }[]
}

export interface StockByWarehouse {
  product_id: string
  product_name: string
  product_sku: string | null
  product_unit: string
  category_name: string | null
  min_stock: number
  cost_price: number | null
  warehouse_id: string
  warehouse_name: string
  quantity: number
  location: string | null
  value: number
  status: StockStatus
}

export interface StockSummary {
  totalProducts: number
  zeroStock: number
  lowStock: number
  totalValue: number
}

export interface StockMovementHistory {
  id: string
  document_number: string | null
  type: string
  status: string
  quantity: number
  occurred_at: string
  warehouse_name: string
  requested_by_name: string | null
}

export function useStock() {
  const { company } = useAuth()
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [stockByWarehouse, setStockByWarehouse] = useState<StockByWarehouse[]>([])
  const [summary, setSummary] = useState<StockSummary>({
    totalProducts: 0,
    zeroStock: 0,
    lowStock: 0,
    totalValue: 0,
  })
  const [loading, setLoading] = useState(true)

  async function fetchStock() {
    if (!company?.id) return
    setLoading(true)
    try {
      const { data: products } = await supabase
        .from("products")
        .select("id, name, sku, unit, min_stock, cost_price, category:categories(name)")
        .eq("company_id", company.id)
        .eq("is_active", true)
        .order("name")

      const { data: stocks } = await supabase
        .from("stock")
        .select("product_id, warehouse_id, quantity, location, warehouse:warehouses(id, name)")
        .eq("company_id", company.id)

      if (!products) return

      const stockMap: Record<string, any[]> = {}
      ;(stocks || []).forEach((s: any) => {
        if (!stockMap[s.product_id]) stockMap[s.product_id] = []
        stockMap[s.product_id].push(s)
      })

      const consolidated: StockItem[] = products.map((p: any) => {
        const productStocks = stockMap[p.id] || []
        const totalQty = productStocks.reduce((acc: number, s: any) => acc + (s.quantity || 0), 0)
        const totalValue = totalQty * (p.cost_price || 0)

        let status: StockStatus = "normal"
        if (totalQty === 0) status = "zerado"
        else if (totalQty < p.min_stock) status = "baixo"

        return {
          product_id: p.id,
          product_name: p.name,
          product_sku: p.sku,
          product_unit: p.unit,
          category_name: p.category?.name || null,
          min_stock: p.min_stock,
          cost_price: p.cost_price,
          total_quantity: totalQty,
          total_value: totalValue,
          status,
          warehouses: productStocks.map((s: any) => ({
            warehouse_id: s.warehouse_id,
            warehouse_name: s.warehouse?.name || "-",
            quantity: s.quantity || 0,
            location: s.location || null,
          })),
        }
      })

      const byWarehouse: StockByWarehouse[] = []
      products.forEach((p: any) => {
        const productStocks = stockMap[p.id] || []
        if (productStocks.length === 0) {
          byWarehouse.push({
            product_id: p.id, product_name: p.name, product_sku: p.sku,
            product_unit: p.unit, category_name: p.category?.name || null,
            min_stock: p.min_stock, cost_price: p.cost_price,
            warehouse_id: "", warehouse_name: "Sem almoxarifado",
            quantity: 0, location: null, value: 0, status: "zerado",
          })
        } else {
          productStocks.forEach((s: any) => {
            const qty = s.quantity || 0
            let status: StockStatus = "normal"
            if (qty === 0) status = "zerado"
            else if (qty < p.min_stock) status = "baixo"
            byWarehouse.push({
              product_id: p.id, product_name: p.name, product_sku: p.sku,
              product_unit: p.unit, category_name: p.category?.name || null,
              min_stock: p.min_stock, cost_price: p.cost_price,
              warehouse_id: s.warehouse_id, warehouse_name: s.warehouse?.name || "-",
              quantity: qty, location: s.location || null,
              value: qty * (p.cost_price || 0), status,
            })
          })
        }
      })

      setStockItems(consolidated)
      setStockByWarehouse(byWarehouse)
      setSummary({
        totalProducts: consolidated.length,
        zeroStock: consolidated.filter(i => i.status === "zerado").length,
        lowStock: consolidated.filter(i => i.status === "baixo").length,
        totalValue: consolidated.reduce((acc, i) => acc + i.total_value, 0),
      })
    } catch (err) {
      toast.error("Erro ao carregar estoque")
    } finally {
      setLoading(false)
    }
  }

  async function fetchProductHistory(productId: string): Promise<StockMovementHistory[]> {
    const { data } = await supabase
      .from("movement_items")
      .select(`
        quantity,
        movement:movements(
          id, document_number, type, status, occurred_at,
          warehouse:warehouses(name),
          requested_by_profile:profiles!movements_requested_by_fkey(full_name)
        )
      `)
      .eq("product_id", productId)
      .limit(50)

    if (import.meta.env.DEV) console.log("[fetchProductHistory] data:", data)

    return (data || [])
      .filter((item: any) => item.movement?.status === "aprovado")
      .sort((a: any, b: any) =>
        new Date(b.movement.occurred_at).getTime() - new Date(a.movement.occurred_at).getTime()
      )
      .map((item: any) => ({
        id: item.movement.id,
        document_number: item.movement.document_number,
        type: item.movement.type,
        status: item.movement.status,
        quantity: item.quantity,
        occurred_at: item.movement.occurred_at,
        warehouse_name: item.movement.warehouse?.name || "-",
        requested_by_name: item.movement.requested_by_profile?.full_name || null,
      }))
  }

  useEffect(() => { fetchStock() }, [company?.id])

  return { stockItems, stockByWarehouse, summary, loading, fetchStock, fetchProductHistory }
}
