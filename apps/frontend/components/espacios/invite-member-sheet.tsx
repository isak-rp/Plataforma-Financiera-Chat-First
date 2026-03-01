"use client"

import { useState, type FormEvent } from "react"
import { X, Mail, Shield, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface InviteMemberSheetProps {
  isOpen: boolean
  onClose: () => void
  workspaceName: string
  onInvited: (data: { email: string; rol: "administrador" | "miembro" }) => void
}

export function InviteMemberSheet({ isOpen, onClose, workspaceName, onInvited }: InviteMemberSheetProps) {
  const [email, setEmail] = useState("")
  const [rol, setRol] = useState<"administrador" | "miembro">("miembro")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !email.includes("@")) return
    onInvited({ email: email.trim(), rol })
    setEmail("")
    setRol("miembro")
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md animate-[slideUp_0.3s_ease-out] rounded-t-2xl border border-card-border bg-card">
        {/* Handle */}
        <div className="flex items-center justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 pt-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Invitar Miembro</h2>
            <p className="text-xs text-muted-foreground">{workspaceName}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 pb-8">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="invite-email" className="text-sm font-medium text-foreground">
              Correo electronico
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-card-border bg-background px-4 py-2.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@correo.com"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Role selector */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Rol</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRol("miembro")}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-xl border px-4 py-3 text-left transition-colors",
                  rol === "miembro"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-card-border bg-background text-muted-foreground hover:border-muted-foreground"
                )}
              >
                <User className="h-4 w-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Miembro</p>
                  <p className="text-[10px] text-muted-foreground">Ver y crear gastos</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRol("administrador")}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-xl border px-4 py-3 text-left transition-colors",
                  rol === "administrador"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-card-border bg-background text-muted-foreground hover:border-muted-foreground"
                )}
              >
                <Shield className="h-4 w-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-[10px] text-muted-foreground">Gestionar todo</p>
                </div>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!email.trim() || !email.includes("@")}
            className={cn(
              "rounded-xl py-3 text-sm font-semibold transition-colors",
              email.trim() && email.includes("@")
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Enviar Invitacion
          </button>
        </form>
      </div>
    </>
  )
}
