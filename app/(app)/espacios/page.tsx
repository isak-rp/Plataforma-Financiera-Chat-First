import { WorkspaceCard } from "@/components/espacios/workspace-card"
import { mockWorkspaces } from "@/lib/mock-data"
import { Plus } from "lucide-react"

export default function EspaciosPage() {
  const personal = mockWorkspaces.filter((w) => w.type === "personal")
  const shared = mockWorkspaces.filter((w) => w.type === "shared")

  return (
    <div className="flex flex-col gap-6 px-4 py-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Mis Espacios</h1>
        <button
          type="button"
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
        {shared.map((workspace) => (
          <WorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
      </section>
    </div>
  )
}
