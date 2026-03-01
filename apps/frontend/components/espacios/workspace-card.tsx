import Link from "next/link"
import { User, Home, Plane, Users, Briefcase, GraduationCap, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Espacio } from "@/lib/api/types"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  home: Home,
  plane: Plane,
  users: Users,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
}

interface WorkspaceCardProps {
  workspace: Espacio & {
    memberCount?: number
    roleLabel?: string
    balance?: number
  }
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const Icon = iconMap[workspace.icono] || Users
  const memberCount = workspace.memberCount ?? (workspace.tipo === "personal" ? 1 : 0)
  const roleLabel = workspace.roleLabel ?? (workspace.tipo === "personal" ? "Propietario" : "Miembro")
  const balance = workspace.balance ?? 0

  return (
    <Link
      href={`/espacios/${workspace.id}`}
      className="flex w-full items-center gap-4 rounded-xl border border-card-border bg-card p-4 text-left transition-colors hover:border-primary/30"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-foreground">{workspace.nombre}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
          </span>
          <span className="text-card-border">|</span>
          <span>{roleLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-primary">{formatCurrency(balance)}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  )
}
