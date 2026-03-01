import { cn } from "@/lib/utils"
import { Bot } from "lucide-react"
import { ActionCard } from "./action-card"

type ActionType = "gasto_registrado" | "consulta_saldo" | "resumen" | "error"

export interface ChatMessageData {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: string
  action?: ActionType
  actionData?: {
    monto?: number
    categoria?: string
    restante?: number
  }
  isError?: boolean
}

interface ChatMessageProps {
  message: ChatMessageData
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user"

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5",
          isUser
            ? "rounded-br-md bg-chat-user text-foreground"
            : "rounded-bl-md bg-chat-bot text-foreground",
          message.isError && "border border-destructive/30 bg-destructive/10"
        )}
      >
        <p className={cn(
          "text-sm leading-relaxed",
          message.isError && "text-destructive"
        )}>
          {message.text}
        </p>

        {/* Action card for bot responses */}
        {message.action && !isUser && (
          <ActionCard action={message.action} data={message.actionData} />
        )}

        <p
          className={cn(
            "mt-1 text-[10px]",
            isUser ? "text-right text-primary/60" : "text-muted-foreground"
          )}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  )
}
