"use client"

import { Utensils, Zap, Flame, Tv, Wrench, Wallet, Users, Check, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import type { EstadoTransaccion, Transaccion } from "@/lib/api/types"

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  utensils: Utensils,
  zap: Zap,
  flame: Flame,
  tv: Tv,
  wrench: Wrench,
}

interface SharedTransactionCardProps {
  transaction: Transaccion
  onUpdateStatus?: (id: string, status: EstadoTransaccion) => void
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

export function SharedTransactionCard({ transaction, onUpdateStatus }: SharedTransactionCardProps) {
  const iconKey = transaction.apartado?.icono ?? "wallet"
  const Icon = categoryIconMap[iconKey] || Wallet
  const showActions = transaction.estado === "pendiente"
  const createdBy = transaction.perfil?.nombre ?? "Miembro"
  const createdByInitials = getInitials(createdBy) || "U"
  const dividedBetweenCount = transaction.dividido_entre?.length ?? 0

  return (
    <div className="rounded-xl border border-card-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground">{transaction.descripcion}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {transaction.apartado?.nombre ?? "General"}
              </p>
            </div>
            <p className="shrink-0 text-sm font-bold text-foreground">{formatCurrency(transaction.monto)}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
              {createdByInitials}
            </span>
            <span>{createdBy.split(" ")[0]}</span>
          </div>

          <span>{transaction.fecha.slice(5)}</span>

          <span className="flex items-center gap-0.5">
            <Users className="h-3 w-3" />
            {"/" + dividedBetweenCount}
          </span>
        </div>

        <StatusBadge status={transaction.estado} />
      </div>

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
