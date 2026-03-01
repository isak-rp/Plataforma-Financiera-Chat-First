import { formatCurrency, getProgressColor, getProgressTrackColor } from "@/lib/utils"

interface SummaryHeaderProps {
  totalBudget: number
  totalSpent: number
}

export function SummaryHeader({ totalBudget, totalSpent }: SummaryHeaderProps) {
  const percentage = Math.round((totalSpent / totalBudget) * 100)
  const remaining = totalBudget - totalSpent

  return (
    <div className="rounded-2xl border border-card-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Gastado este mes
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Disponible
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{percentage}% utilizado</span>
          <span>de {formatCurrency(totalBudget)}</span>
        </div>
        <div className={`mt-2 h-2.5 w-full overflow-hidden rounded-full ${getProgressTrackColor(percentage)}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
