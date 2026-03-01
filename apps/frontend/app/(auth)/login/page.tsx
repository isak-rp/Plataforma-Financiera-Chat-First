"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MessageSquare, Eye, EyeOff } from "lucide-react"
import { ApiClientError, setAccessToken } from "@/lib/api/client"
import { login } from "@/lib/api/services"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await login({ email, password })
      setAccessToken(response.access_token)
      router.push("/chat")
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.detail)
      } else {
        setError("No fue posible iniciar sesion. Intenta de nuevo.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">FinChat</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tus finanzas, en una conversacion
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
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
              placeholder="Tu contrasena"
              required
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

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Iniciando sesion..." : "Iniciar Sesion"}
        </button>
      </form>

      <p className="text-sm text-muted-foreground">
        {"No tienes cuenta? "}
        <Link
          href="/registro"
          className="font-medium text-primary hover:underline"
        >
          Registrate
        </Link>
      </p>
    </div>
  )
}
