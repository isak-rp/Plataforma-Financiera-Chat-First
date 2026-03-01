import { ProfileHeader } from "@/components/perfil/profile-header"
import { SettingsList } from "@/components/perfil/settings-list"
import { mockUser } from "@/lib/mock-data"

export default function PerfilPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-card-border px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Mi Perfil</h1>
      </div>

      {/* Profile info */}
      <ProfileHeader user={mockUser} />

      {/* Settings */}
      <div className="rounded-2xl border border-card-border bg-card mx-4 overflow-hidden">
        <SettingsList />
      </div>
    </div>
  )
}
