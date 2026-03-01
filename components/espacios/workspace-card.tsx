import Link from "next/link"
import { User, Home, Plane, Users, Briefcase, GraduationCap, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Workspace } from "@/lib/mock-data"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  home: Home,
  plane: Plane,
  users: Users,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
}

interface WorkspaceCardProps {
  workspace: Workspace
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const Icon = iconMap[workspace.icon] || Users

  return (
    <Link
      href={`/espacios/${workspace.id}`}
      className="flex w-full items-center gap-4 rounded-xl border border-card-border bg-card p-4 text-left transition-colors hover:border-primary/30"
    >
      {/* Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-foreground">
          {workspace.name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {workspace.memberCount}{" "}
            {workspace.memberCount === 1 ? "miembro" : "miembros"}
          </span>
          <span className="text-card-border">|</span>
          <span>{workspace.role}</span>
        </div>
      </div>

      {/* Balance + chevron */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-primary">
          {formatCurrency(workspace.balance)}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  )
}
