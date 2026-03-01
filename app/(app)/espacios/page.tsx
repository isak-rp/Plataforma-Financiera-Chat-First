"use client"

import { useState } from "react"
import { WorkspaceCard } from "@/components/espacios/workspace-card"
import { CreateWorkspaceSheet } from "@/components/espacios/create-workspace-sheet"
import { mockWorkspaces, type Workspace } from "@/lib/mock-data"
import { Plus } from "lucide-react"

export default function EspaciosPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(mockWorkspaces)
  const [showCreate, setShowCreate] = useState(false)

  const personal = workspaces.filter((w) => w.type === "personal")
  const shared = workspaces.filter((w) => w.type === "shared")

  function handleCreated(data: { nombre: string; icono: string; descripcion: string }) {
    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: data.nombre,
      type: "shared",
      memberCount: 1,
      role: "Propietario",
      balance: 0,
      icon: data.icono,
    }
    setWorkspaces((prev) => [...prev, newWorkspace])
  }

  return (
    <>
      <div className="flex flex-col gap-6 px-4 py-5">
        {/* Header */}
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

        {/* Personal */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Personal
          </h2>
          {personal.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </section>

        {/* Shared */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Compartidos
          </h2>
          {shared.length === 0 ? (
            <div className="rounded-xl border border-dashed border-card-border bg-card/50 px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No tienes espacios compartidos aun.
              </p>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                Crear uno ahora
              </button>
            </div>
          ) : (
            shared.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))
          )}
        </section>
      </div>

      {/* Create workspace bottom sheet */}
      <CreateWorkspaceSheet
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
    </>
  )
}
