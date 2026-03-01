"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, UserPlus, Users, Home, Plane, User,
  Briefcase, GraduationCap
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { MemberList } from "@/components/espacios/member-list"
import { SharedTransactionCard } from "@/components/espacios/shared-transaction-card"
import { InviteMemberSheet } from "@/components/espacios/invite-member-sheet"
import {
  mockWorkspaces,
  mockSharedMembers,
  mockSharedTransactions,
  type SharedMember,
  type SharedTransaction,
  type TransactionStatus,
} from "@/lib/mock-data"

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

  const workspace = mockWorkspaces.find((w) => w.id === workspaceId)
  const [members, setMembers] = useState<SharedMember[]>(mockSharedMembers)
  const [transactions, setTransactions] = useState<SharedTransaction[]>(mockSharedTransactions)
  const [showInvite, setShowInvite] = useState(false)
  const [activeTab, setActiveTab] = useState<"transacciones" | "miembros">("transacciones")

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

  const Icon = iconMap[workspace.icon] || Users
  const isShared = workspace.type === "shared"
  const pendingCount = transactions.filter((t) => t.status === "pendiente").length

  function handleUpdateStatus(txnId: string, newStatus: TransactionStatus) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: newStatus } : t))
    )
  }

  function handleInvited(data: { email: string; rol: "administrador" | "miembro" }) {
    const newMember: SharedMember = {
      id: `member-${Date.now()}`,
      name: data.email.split("@")[0],
      email: data.email,
      initials: data.email.slice(0, 2).toUpperCase(),
      role: data.rol,
      accepted: false,
    }
    setMembers((prev) => [...prev, newMember])
  }

  // Sort: pending first, then by date desc
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (a.status === "pendiente" && b.status !== "pendiente") return -1
    if (b.status === "pendiente" && a.status !== "pendiente") return 1
    return b.date.localeCompare(a.date)
  })

  return (
    <>
      <div className="flex h-dvh flex-col">
        {/* Header */}
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
              <h1 className="truncate text-base font-semibold text-foreground">
                {workspace.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {workspace.memberCount} {workspace.memberCount === 1 ? "miembro" : "miembros"}
                {" - " + workspace.role}
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

          {/* Balance summary */}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Balance total</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(workspace.balance)}</p>
            </div>
            {pendingCount > 0 && (
              <div className="rounded-lg bg-amber-400/10 px-3 py-1.5">
                <p className="text-xs font-medium text-amber-400">
                  {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          {/* Tab switcher */}
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

        {/* Content */}
        <div className="hide-scrollbar flex-1 overflow-y-auto px-4 py-4 pb-24">
          {activeTab === "transacciones" ? (
            <div className="flex flex-col gap-3">
              {sortedTransactions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-card-border bg-card/50 px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay transacciones aun.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Usa el chat para registrar gastos en este espacio.
                  </p>
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

              {/* Invite CTA at the bottom */}
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

      {/* Invite member sheet */}
      <InviteMemberSheet
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        workspaceName={workspace.name}
        onInvited={handleInvited}
      />
    </>
  )
}
