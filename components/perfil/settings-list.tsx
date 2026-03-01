"use client"

import {
  UserPen,
  Bell,
  Coins,
  Moon,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface SettingItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value?: string
  destructive?: boolean
  action?: () => void
}

export function SettingsList() {
  const router = useRouter()

  const items: SettingItem[] = [
    { icon: UserPen, label: "Editar Perfil" },
    { icon: Bell, label: "Notificaciones" },
    { icon: Coins, label: "Moneda", value: "MXN" },
    { icon: Moon, label: "Tema", value: "Oscuro" },
    { icon: Info, label: "Acerca de" },
    {
      icon: LogOut,
      label: "Cerrar Sesion",
      destructive: true,
      action: () => router.push("/login"),
    },
  ]

  return (
    <div className="flex flex-col">
      {items.map((item, index) => (
        <button
          key={item.label}
          type="button"
          onClick={item.action}
          className={`flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-card ${
            index !== items.length - 1 ? "border-b border-card-border" : ""
          }`}
        >
          <item.icon
            className={`h-5 w-5 ${
              item.destructive ? "text-destructive" : "text-muted-foreground"
            }`}
          />
          <span
            className={`flex-1 text-sm font-medium ${
              item.destructive ? "text-destructive" : "text-foreground"
            }`}
          >
            {item.label}
          </span>
          {item.value && (
            <span className="text-xs text-muted-foreground">{item.value}</span>
          )}
          {!item.destructive && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      ))}
    </div>
  )
}
