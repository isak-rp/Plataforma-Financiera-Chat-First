"use client"

import { useState, useRef, useEffect } from "react"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
import {
  mockMessages,
  mockBotResponses,
  mockUser,
  type ChatMessage as ChatMessageType,
} from "@/lib/mock-data"
import { Sparkles } from "lucide-react"

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>(mockMessages)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleSend(text: string) {
    const now = new Date()
    const timeStr = now.toLocaleTimeString("es-MX", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      text,
      sender: "user",
      timestamp: timeStr,
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate bot response after a short delay
    setTimeout(() => {
      const randomResponse =
        mockBotResponses[Math.floor(Math.random() * mockBotResponses.length)]
      const botMessage: ChatMessageType = {
        id: `bot-${Date.now()}`,
        text: randomResponse,
        sender: "bot",
        timestamp: timeStr,
      }
      setMessages((prev) => [...prev, botMessage])
    }, 800)
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
            Tu asistente financiero
          </p>
        </div>
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
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  )
}
