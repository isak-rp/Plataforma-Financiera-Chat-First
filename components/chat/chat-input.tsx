"use client"

import { useState, type FormEvent } from "react"
import { SendHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (text: string) => void
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-20 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-card-border bg-background/95 px-4 py-3 backdrop-blur-lg"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Escribe tu gasto..."
          className="flex-1 rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            value.trim()
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground"
          )}
          aria-label="Enviar mensaje"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </div>
    </form>
  )
}
