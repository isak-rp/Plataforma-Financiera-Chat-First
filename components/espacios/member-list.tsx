import { Shield, Crown, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SharedMember } from "@/lib/mock-data"

interface MemberListProps {
  members: SharedMember[]
}

const roleConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  propietario: { icon: Crown, label: "Propietario", color: "text-amber-400" },
  administrador: { icon: Shield, label: "Admin", color: "text-blue-400" },
  miembro: { icon: () => null, label: "Miembro", color: "text-muted-foreground" },
}

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="flex flex-col gap-1">
      {members.map((member) => {
        const config = roleConfig[member.role]
        const RoleIcon = config.icon

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent/50"
          >
            {/* Avatar */}
            <div className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              member.accepted
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}>
              {member.initials}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className={cn(
                  "truncate text-sm font-medium",
                  member.accepted ? "text-foreground" : "text-muted-foreground"
                )}>
                  {member.name}
                </p>
                {!member.accepted && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                    <Clock className="h-2.5 w-2.5" />
                    Pendiente
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{member.email}</p>
            </div>

            {/* Role badge */}
            <div className={cn("flex items-center gap-1 text-xs font-medium", config.color)}>
              <RoleIcon className="h-3.5 w-3.5" />
              <span>{config.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
