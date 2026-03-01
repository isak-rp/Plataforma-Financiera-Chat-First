import { Check, TrendingDown, TrendingUp, BarChart3, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type ActionType = "gasto_registrado" | "consulta_saldo" | "resumen" | "error"

interface ActionCardProps {
  action: ActionType
  data?: {
    monto?: number
    categoria?: string
    restante?: number
  }
}

const actionConfig: Record<
  ActionType,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string; bgColor: string }
> = {
  gasto_registrado: {
    icon: TrendingDown,
    label: "Gasto registrado",
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
  },
  consulta_saldo: {
    icon: TrendingUp,
    label: "Consulta de saldo",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10 border-blue-400/20",
  },
  resumen: {
    icon: BarChart3,
    label: "Resumen generado",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10 border-amber-400/20",
  },
  error: {
    icon: AlertCircle,
    label: "Error al procesar",
    color: "text-destructive",
    bgColor: "bg-destructive/10 border-destructive/20",
  },
}

export function ActionCard({ action, data }: ActionCardProps) {
  const config = actionConfig[action]
  const Icon = config.icon

  return (
    <div className={`mt-2 flex items-center gap-3 rounded-xl border px-3 py-2.5 ${config.bgColor}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold ${config.color}`}>{config.label}</p>
        {data?.monto != null && (
          <p className="text-sm font-bold text-foreground">
            {formatCurrency(data.monto)}
            {data.categoria && (
              <span className="ml-1 font-normal text-muted-foreground">
                {"en " + data.categoria}
              </span>
            )}
          </p>
        )}
        {data?.restante != null && (
          <p className="text-xs text-muted-foreground">
            {"Restante: " + formatCurrency(data.restante)}
          </p>
        )}
      </div>
      {action === "gasto_registrado" && (
        <Check className="h-5 w-5 shrink-0 text-primary" />
      )}
    </div>
  )
}
