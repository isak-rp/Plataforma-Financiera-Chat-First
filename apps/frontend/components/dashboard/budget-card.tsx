import { Utensils, Car, Home, Gamepad2, PiggyBank, Wallet } from "lucide-react"
import { formatCurrency, getProgressColor, getProgressTrackColor } from "@/lib/utils"
import type { Apartado } from "@/lib/api/types"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  utensils: Utensils,
  car: Car,
  home: Home,
  "gamepad-2": Gamepad2,
  "piggy-bank": PiggyBank,
}

interface BudgetCardProps {
  category: Apartado
}

export function BudgetCard({ category }: BudgetCardProps) {
  const budget = Number(category.presupuesto || 0)
  const spent = Number(category.gastado || 0)
  const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0
  const remaining = budget - spent
  const Icon = iconMap[category.icono] || Wallet

  return (
    <div className="rounded-xl border border-card-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{category.nombre}</h3>
            <span className="text-xs text-muted-foreground">{percentage}%</span>
          </div>

          <div className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${getProgressTrackColor(percentage)}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {formatCurrency(spent)} de {formatCurrency(budget)}
            </span>
            <span className={remaining >= 0 ? "text-primary" : "text-destructive"}>
              {remaining >= 0
                ? `${formatCurrency(remaining)} restante`
                : `${formatCurrency(Math.abs(remaining))} excedido`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
