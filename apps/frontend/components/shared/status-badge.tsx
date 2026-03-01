import { cn } from "@/lib/utils"
import { Clock, Check, CheckCheck, X, CircleDollarSign } from "lucide-react"
import type { EstadoTransaccion } from "@/lib/api/types"

interface StatusBadgeProps {
  status: EstadoTransaccion
  size?: "sm" | "md"
}

const statusConfig: Record<
  EstadoTransaccion,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  pendiente: {
    label: "Pendiente",
    icon: Clock,
    className: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  },
  confirmada: {
    label: "Confirmada",
    icon: Check,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  aceptada: {
    label: "Aceptada",
    icon: CheckCheck,
    className: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  },
  rechazada: {
    label: "Rechazada",
    icon: X,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  liquidada: {
    label: "Liquidada",
    icon: CircleDollarSign,
    className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
  },
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        config.className,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {config.label}
    </span>
  )
}
