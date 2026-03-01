"use client"

import { useEffect, useMemo, useState } from "react"
import { SummaryHeader } from "@/components/dashboard/summary-header"
import { BudgetCard } from "@/components/dashboard/budget-card"
import { ApiClientError } from "@/lib/api/client"
import { getApartados, getEspacios } from "@/lib/api/services"
import type { Apartado } from "@/lib/api/types"

export default function DashboardPage() {
  const [categories, setCategories] = useState<Apartado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        const espacios = await getEspacios()
        const personal = espacios.find((space) => space.tipo === "personal")
        const targetSpace = personal ?? espacios[0]

        if (!targetSpace) {
          if (!cancelled) setCategories([])
          return
        }

        const apartados = await getApartados(targetSpace.id)
        if (!cancelled) setCategories(apartados)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiClientError) {
          setError(err.detail)
        } else {
          setError("No fue posible cargar tus apartados.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [])

  const totalBudget = useMemo(
    () => categories.reduce((sum, cat) => sum + Number(cat.presupuesto || 0), 0),
    [categories]
  )

  const totalSpent = useMemo(
    () => categories.reduce((sum, cat) => sum + Number(cat.gastado || 0), 0),
    [categories]
  )

  const currentMonth = new Date().toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Mis Apartados</h1>
        <p className="mt-0.5 text-sm capitalize text-muted-foreground">{currentMonth}</p>
      </div>

      <SummaryHeader totalBudget={totalBudget} totalSpent={totalSpent} />

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Categorias</h2>

        {loading && (
          <p className="rounded-xl border border-card-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Cargando apartados...
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!loading && !error && categories.length === 0 && (
          <p className="rounded-xl border border-dashed border-card-border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
            No hay apartados en este espacio.
          </p>
        )}

        {!loading && !error && categories.map((category) => <BudgetCard key={category.id} category={category} />)}
      </div>
    </div>
  )
}
