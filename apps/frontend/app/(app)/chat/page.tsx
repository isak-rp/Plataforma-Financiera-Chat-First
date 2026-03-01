"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChatMessage, type ChatMessageData } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { Sparkles } from "lucide-react"
import { ApiClientError } from "@/lib/api/client"
import { enviarMensajeChat, getEspacios, getPerfil } from "@/lib/api/services"

const initialMessages: ChatMessageData[] = [
  {
    id: "boot-1",
    text: "Hola, soy tu asistente financiero. Puedes decirme tus gastos y yo los registro por ti.",
    sender: "bot",
    timestamp: "9:00 AM",
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState("Usuario")
  const [defaultEspacioId, setDefaultEspacioId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const [perfil, espacios] = await Promise.all([getPerfil(), getEspacios()])
        if (cancelled) return

        setUserName(perfil.nombre.split(" ")[0] || "Usuario")
        const personal = espacios.find((s) => s.tipo === "personal")
        setDefaultEspacioId(personal?.id ?? espacios[0]?.id ?? null)
      } catch {
        if (!cancelled) {
          setDefaultEspacioId(null)
        }
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSend(text: string) {
    const now = new Date()
    const timeStr = now.toLocaleTimeString("es-MX", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    const userMessage: ChatMessageData = {
      id: `user-${Date.now()}`,
      text,
      sender: "user",
      timestamp: timeStr,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      if (!defaultEspacioId) {
        throw new Error("No tienes un espacio activo para registrar transacciones.")
      }

      const response = await enviarMensajeChat({
        mensaje: text,
        espacio_id: defaultEspacioId,
      })

      const botMessage: ChatMessageData = {
        id: response.id,
        text: response.respuesta,
        sender: "bot",
        timestamp: timeStr,
        action: response.accion,
        actionData: response.transaccion
          ? {
              monto: response.transaccion.monto,
              categoria: response.transaccion.apartado?.nombre ?? response.transaccion.descripcion,
            }
          : undefined,
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const detail =
        error instanceof ApiClientError
          ? error.detail
          : error instanceof Error
            ? error.message
            : "Hubo un error al procesar tu mensaje. Intenta de nuevo."

      const errorMessage: ChatMessageData = {
        id: `error-${Date.now()}`,
        text: detail,
        sender: "bot",
        timestamp: timeStr,
        action: "error",
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-3 border-b border-card-border bg-card/80 px-4 py-3 backdrop-blur-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground">{"Hola, " + userName}</h1>
          <p className="text-xs text-muted-foreground">{isLoading ? "Escribiendo..." : "Tu asistente financiero"}</p>
        </div>
        {isLoading && <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-primary" />}
      </header>

      <div ref={scrollRef} className="hide-scrollbar flex-1 overflow-y-auto px-4 py-4 pb-36">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
        </div>
      </div>

      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  )
}
