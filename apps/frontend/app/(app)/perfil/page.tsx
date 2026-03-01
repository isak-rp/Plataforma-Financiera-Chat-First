"use client"

import { useEffect, useState } from "react"
import { ProfileHeader } from "@/components/perfil/profile-header"
import { SettingsList } from "@/components/perfil/settings-list"
import { ApiClientError } from "@/lib/api/client"
import { getPerfil } from "@/lib/api/services"
import type { Perfil } from "@/lib/api/types"

export default function PerfilPage() {
  const [user, setUser] = useState<Perfil | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      try {
        const data = await getPerfil()
        if (!cancelled) setUser(data)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiClientError) {
          setError(err.detail)
        } else {
          setError("No fue posible cargar tu perfil.")
        }
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col">
      <div className="border-b border-card-border px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Mi Perfil</h1>
      </div>

      {error && (
        <p className="mx-4 mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {user ? (
        <ProfileHeader user={user} />
      ) : (
        <div className="px-4 py-6 text-sm text-muted-foreground">Cargando perfil...</div>
      )}

      <div className="mx-4 overflow-hidden rounded-2xl border border-card-border bg-card">
        <SettingsList />
      </div>
    </div>
  )
}
