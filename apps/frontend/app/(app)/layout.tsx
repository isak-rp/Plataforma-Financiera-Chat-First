"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { clearAccessToken, getAccessToken, initializeAccessToken } from "@/lib/api/client"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    initializeAccessToken()

    const onUnauthorized = () => {
      clearAccessToken()
      router.push("/login")
    }

    window.addEventListener("finchat:unauthorized", onUnauthorized)

    if (!getAccessToken()) {
      router.push("/login")
    }

    return () => {
      window.removeEventListener("finchat:unauthorized", onUnauthorized)
    }
  }, [router])

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
