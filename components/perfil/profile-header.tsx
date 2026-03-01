import type { UserProfile } from "@/lib/mock-data"

interface ProfileHeaderProps {
  user: UserProfile
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {/* Avatar */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/40">
        <span className="text-2xl font-bold text-primary">
          {user.avatarInitials}
        </span>
      </div>

      {/* Name and email */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
    </div>
  )
}
