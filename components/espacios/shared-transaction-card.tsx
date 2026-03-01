"use client"

import {
  Utensils, Zap, Flame, Tv, Wrench, Wallet, Users,
  Check, X
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import type { SharedTransaction, TransactionStatus } from "@/lib/mock-data"

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  utensils: Utensils,
  zap: Zap,
  flame: Flame,
  tv: Tv,
  wrench: Wrench,
}

interface SharedTransactionCardProps {
  transaction: SharedTransaction
  onUpdateStatus?: (id: string, status: TransactionStatus) => void
}

export function SharedTransactionCard({ transaction, onUpdateStatus }: SharedTransactionCardProps) {
  const Icon = categoryIconMap[transaction.categoryIcon] || Wallet
  const showActions = transaction.status === "pendiente"

  return (
    <div className="rounded-xl border border-card-border bg-card p-4 transition-colors hover:border-primary/30">
      {/* Top row: icon + description + amount */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {transaction.description}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {transaction.category}
              </p>
            </div>
            <p className="shrink-0 text-sm font-bold text-foreground">
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>
      </div>

      {/* Meta row: who, when, status, split */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {/* Created by */}
          <div className="flex items-center gap-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
              {transaction.createdByInitials}
            </span>
            <span>{transaction.createdBy.split(" ")[0]}</span>
          </div>

          {/* Date */}
          <span>{transaction.date.slice(5)}</span>

          {/* Split indicator */}
          <span className="flex items-center gap-0.5">
            <Users className="h-3 w-3" />
            {"/" + transaction.dividedBetween.length}
          </span>
        </div>

        <StatusBadge status={transaction.status} />
      </div>

      {/* Action buttons for pending transactions */}
      {showActions && onUpdateStatus && (
        <div className="mt-3 flex gap-2 border-t border-card-border pt-3">
          <button
            onClick={() => onUpdateStatus(transaction.id, "aceptada")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <Check className="h-3.5 w-3.5" />
            Aceptar
          </button>
          <button
            onClick={() => onUpdateStatus(transaction.id, "rechazada")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-destructive/10 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
          >
            <X className="h-3.5 w-3.5" />
            Rechazar
          </button>
        </div>
      )}
    </div>
  )
}
