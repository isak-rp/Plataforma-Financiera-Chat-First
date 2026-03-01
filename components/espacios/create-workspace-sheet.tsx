"use client"

import { useState, type FormEvent } from "react"
import { X, Users, Plane, Home, Briefcase, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateWorkspaceSheetProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (data: { nombre: string; icono: string; descripcion: string }) => void
}

const iconOptions = [
  { value: "home", label: "Casa", icon: Home },
  { value: "users", label: "Grupo", icon: Users },
  { value: "plane", label: "Viaje", icon: Plane },
  { value: "briefcase", label: "Trabajo", icon: Briefcase },
  { value: "graduation-cap", label: "Escuela", icon: GraduationCap },
]

export function CreateWorkspaceSheet({ isOpen, onClose, onCreated }: CreateWorkspaceSheetProps) {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("users")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    onCreated({ nombre: nombre.trim(), icono: selectedIcon, descripcion: descripcion.trim() })
    setNombre("")
    setDescripcion("")
    setSelectedIcon("users")
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
          <h2 className="text-lg font-bold text-foreground">Nuevo Espacio Compartido</h2>
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
          {/* Name input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="ws-name" className="text-sm font-medium text-foreground">
              Nombre del espacio
            </label>
            <input
              id="ws-name"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="ej. Casa Familia, Viaje Playa..."
              className="rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label htmlFor="ws-desc" className="text-sm font-medium text-foreground">
              Descripcion <span className="text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="ws-desc"
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Gastos compartidos de..."
              className="rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Icon picker */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Icono</p>
            <div className="flex gap-2">
              {iconOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedIcon(opt.value)}
                  className={cn(
                    "flex h-12 w-12 flex-col items-center justify-center rounded-xl border transition-colors",
                    selectedIcon === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-card-border bg-background text-muted-foreground hover:border-muted-foreground"
                  )}
                  aria-label={opt.label}
                >
                  <opt.icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!nombre.trim()}
            className={cn(
              "rounded-xl py-3 text-sm font-semibold transition-colors",
              nombre.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Crear Espacio
          </button>
        </form>
      </div>
    </>
  )
}
