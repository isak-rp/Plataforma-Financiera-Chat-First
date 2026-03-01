"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MessageSquare, Eye, EyeOff } from "lucide-react"

export default function RegistroPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) return
    setLoading(true)
    // Mock registration -- just redirect
    setTimeout(() => {
      router.push("/chat")
    }, 600)
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Crear Cuenta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comienza a gestionar tus finanzas
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="name"
            className="text-sm font-medium text-muted-foreground"
          >
            Nombre completo
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Carlos Lopez"
            required
            className="rounded-xl border border-card-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium text-muted-foreground"
          >
            Correo electronico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="rounded-xl border border-card-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-muted-foreground"
          >
            Contrasena
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 8 caracteres"
              required
              minLength={8}
              className="w-full rounded-xl border border-card-border bg-card px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirm-password"
            className="text-sm font-medium text-muted-foreground"
          >
            Confirmar contrasena
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite tu contrasena"
            required
            minLength={8}
            className="rounded-xl border border-card-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-destructive">
              Las contrasenas no coinciden
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || (!!confirmPassword && password !== confirmPassword)}
          className="mt-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>

      {/* Login link */}
      <p className="text-sm text-muted-foreground">
        {"Ya tienes cuenta? "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Inicia Sesion
        </Link>
      </p>
    </div>
  )
}
