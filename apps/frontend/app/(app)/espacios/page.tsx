"use client"

import { useEffect, useMemo, useState } from "react"
import { WorkspaceCard } from "@/components/espacios/workspace-card"
import { CreateWorkspaceSheet } from "@/components/espacios/create-workspace-sheet"
import { Plus } from "lucide-react"
import { ApiClientError } from "@/lib/api/client"
import { crearEspacio, getEspacios } from "@/lib/api/services"
import type { Espacio } from "@/lib/api/types"

export default function EspaciosPage() {
  const [workspaces, setWorkspaces] = useState<Espacio[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadEspacios() {
    setLoading(true)
    setError(null)
    try {
      const data = await getEspacios()
      setWorkspaces(data)
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.detail)
      } else {
        setError("No fue posible cargar los espacios.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEspacios()
  }, [])

  const personal = useMemo(() => workspaces.filter((w) => w.tipo === "personal"), [workspaces])
  const shared = useMemo(() => workspaces.filter((w) => w.tipo === "compartido"), [workspaces])

  async function handleCreated(data: { nombre: string; icono: string; descripcion: string }) {
    try {
      await crearEspacio({
        nombre: data.nombre,
        tipo: "compartido",
        descripcion: data.descripcion || undefined,
        icono: data.icono,
      })
      await loadEspacios()
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.detail)
      } else {
        setError("No fue posible crear el espacio.")
      }
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 px-4 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Mis Espacios</h1>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90"
            aria-label="Crear nuevo espacio"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {loading && (
          <p className="rounded-xl border border-card-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Cargando espacios...
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!loading && !error && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Personal</h2>
            {personal.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </section>
        )}

        {!loading && !error && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Compartidos</h2>
            {shared.length === 0 ? (
              <div className="rounded-xl border border-dashed border-card-border bg-card/50 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No tienes espacios compartidos aun.</p>
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="mt-2 text-sm font-medium text-primary hover:underline"
                >
                  Crear uno ahora
                </button>
              </div>
            ) : (
              shared.map((workspace) => <WorkspaceCard key={workspace.id} workspace={workspace} />)
            )}
          </section>
        )}
      </div>

      <CreateWorkspaceSheet isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
    </>
  )
}
