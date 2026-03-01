"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChatMessage, type ChatMessageData } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { enviarMensajeChat } from "@/lib/api/services"
import { mockUser } from "@/lib/mock-data"
import { Sparkles } from "lucide-react"

const initialMessages: ChatMessageData[] = [
  {
    id: "1",
    text: "Hola Carlos! Soy tu asistente financiero. Puedes decirme tus gastos y yo los registro por ti.",
    sender: "bot",
    timestamp: "9:00 AM",
  },
  {
    id: "2",
    text: "Gaste 150 en comida",
    sender: "user",
    timestamp: "9:02 AM",
  },
  {
    id: "3",
    text: "Listo! Registre $150 en Comida. Te quedan $850 de $1,000 este mes.",
    sender: "bot",
    timestamp: "9:02 AM",
    action: "gasto_registrado",
    actionData: { monto: 150, categoria: "Comida", restante: 850 },
  },
  {
    id: "4",
    text: "Tambien pague 100 de Uber",
    sender: "user",
    timestamp: "9:05 AM",
  },
  {
    id: "5",
    text: "Registrado! $100 en Transporte. Llevas $100 de $500 este mes. Vas muy bien!",
    sender: "bot",
    timestamp: "9:05 AM",
    action: "gasto_registrado",
    actionData: { monto: 100, categoria: "Transporte", restante: 400 },
  },
  {
    id: "6",
    text: "Cuanto me queda para entretenimiento?",
    sender: "user",
    timestamp: "9:10 AM",
  },
  {
    id: "7",
    text: "En Entretenimiento tienes $50 disponibles de $400. Llevas gastados $350 este mes. Te recomiendo cuidar ese apartado.",
    sender: "bot",
    timestamp: "9:10 AM",
    action: "consulta_saldo",
    actionData: { monto: 350, categoria: "Entretenimiento", restante: 50 },
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  async function handleSend(text: string) {
    const now = new Date()
    const timeStr = now.toLocaleTimeString("es-MX", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    // Add user message immediately
    const userMessage: ChatMessageData = {
      id: `user-${Date.now()}`,
      text,
      sender: "user",
      timestamp: timeStr,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Call the service (mock or real backend)
      const response = await enviarMensajeChat({
        mensaje: text,
        espacio_id: "1", // Default personal space
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
              categoria: response.transaccion.apartado?.nombre,
            }
          : undefined,
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      // Show error as a bot message
      const errorMessage: ChatMessageData = {
        id: `error-${Date.now()}`,
        text:
          error instanceof Error
            ? error.message
            : "Hubo un error al procesar tu mensaje. Intenta de nuevo.",
        sender: "bot",
        timestamp: timeStr,
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-card-border bg-card/80 px-4 py-3 backdrop-blur-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground">
            {"Hola, " + mockUser.name.split(" ")[0]}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Escribiendo..." : "Tu asistente financiero"}
          </p>
        </div>
        {isLoading && (
          <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="hide-scrollbar flex-1 overflow-y-auto px-4 py-4 pb-36"
      >
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  )
}
