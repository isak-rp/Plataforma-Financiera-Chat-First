import type { Perfil } from "@/lib/api/types"

interface ProfileHeaderProps {
  user: Perfil
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials = user.nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/40">
        <span className="text-2xl font-bold text-primary">{initials || "U"}</span>
      </div>

      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground">{user.nombre}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
    </div>
  )
}
