"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, UserPlus, Users, Home, Plane, User, Briefcase, GraduationCap } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { MemberList } from "@/components/espacios/member-list"
import { SharedTransactionCard } from "@/components/espacios/shared-transaction-card"
import { InviteMemberSheet } from "@/components/espacios/invite-member-sheet"
import { ApiClientError } from "@/lib/api/client"
import { actualizarEstadoTransaccion, getEspacioDetalle, getTransacciones, invitarMiembro } from "@/lib/api/services"
import type { EspacioDetalle, EstadoTransaccion, MiembroEspacio, Transaccion } from "@/lib/api/types"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  home: Home,
  plane: Plane,
  users: Users,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
}

export default function WorkspaceDetailPage() {
  const params = useParams()
  const workspaceId = params.id as string

  const [workspace, setWorkspace] = useState<EspacioDetalle | null>(null)
  const [members, setMembers] = useState<MiembroEspacio[]>([])
  const [transactions, setTransactions] = useState<Transaccion[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [activeTab, setActiveTab] = useState<"transacciones" | "miembros">("transacciones")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWorkspace = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setError(null)

    try {
      const [detalle, txs] = await Promise.all([
        getEspacioDetalle(workspaceId),
        getTransacciones(workspaceId),
      ])
      setWorkspace(detalle)
      setMembers(detalle.miembros)
      setTransactions(txs)
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.detail)
      } else {
        setError("No fue posible cargar el espacio.")
      }
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    loadWorkspace()
  }, [loadWorkspace])

  const pendingCount = useMemo(
    () => transactions.filter((t) => t.estado === "pendiente").length,
    [transactions]
  )

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      if (a.estado === "pendiente" && b.estado !== "pendiente") return -1
      if (b.estado === "pendiente" && a.estado !== "pendiente") return 1
      return b.fecha.localeCompare(a.fecha)
    })
  }, [transactions])

  async function handleUpdateStatus(txnId: string, newStatus: EstadoTransaccion) {
    try {
      await actualizarEstadoTransaccion(txnId, { estado: newStatus })
      await loadWorkspace()
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.detail)
      } else {
        setError("No fue posible actualizar el estado.")
      }
    }
  }

  async function handleInvited(data: { email: string; rol: "administrador" | "miembro" }) {
    if (!workspace) return

    try {
      await invitarMiembro(workspace.id, { email: data.email, rol: data.rol })
      await loadWorkspace()
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.detail)
      } else {
        setError("No fue posible invitar al miembro.")
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Cargando espacio...</p>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Espacio no encontrado</p>
        <Link href="/espacios" className="text-sm font-medium text-primary hover:underline">
          Volver a Espacios
        </Link>
      </div>
    )
  }

  const Icon = iconMap[workspace.icono] || Users
  const isShared = workspace.tipo === "compartido"

  return (
    <>
      <div className="flex h-dvh flex-col">
        <header className="border-b border-card-border bg-card/80 px-4 py-3 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <Link
              href="/espacios"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-foreground">{workspace.nombre}</h1>
              <p className="text-xs text-muted-foreground">
                {members.length} {members.length === 1 ? "miembro" : "miembros"}
              </p>
            </div>

            {isShared && (
              <button
                onClick={() => setShowInvite(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                aria-label="Invitar miembro"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Balance total</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(workspace.balance_total ?? 0)}</p>
            </div>
            {pendingCount > 0 && (
              <div className="rounded-lg bg-amber-400/10 px-3 py-1.5">
                <p className="text-xs font-medium text-amber-400">
                  {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          {isShared && (
            <div className="mt-3 flex gap-1 rounded-lg bg-accent/50 p-1">
              <button
                onClick={() => setActiveTab("transacciones")}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === "transacciones"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Transacciones
              </button>
              <button
                onClick={() => setActiveTab("miembros")}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === "miembros"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Miembros ({members.length})
              </button>
            </div>
          )}
        </header>

        <div className="hide-scrollbar flex-1 overflow-y-auto px-4 py-4 pb-24">
          {error && (
            <p className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {activeTab === "transacciones" ? (
            <div className="flex flex-col gap-3">
              {sortedTransactions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-card-border bg-card/50 px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No hay transacciones aun.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Usa el chat para registrar gastos en este espacio.</p>
                </div>
              ) : (
                sortedTransactions.map((txn) => (
                  <SharedTransactionCard
                    key={txn.id}
                    transaction={txn}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <MemberList members={members} />

              <button
                onClick={() => setShowInvite(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
              >
                <UserPlus className="h-4 w-4" />
                Invitar a alguien mas
              </button>
            </div>
          )}
        </div>
      </div>

      <InviteMemberSheet
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        workspaceName={workspace.nombre}
        onInvited={handleInvited}
      />
    </>
  )
}
