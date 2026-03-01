import { cn } from "@/lib/utils"
import type { ChatMessage as ChatMessageType } from "@/lib/mock-data"
import { Bot } from "lucide-react"

interface ChatMessageProps {
  message: ChatMessageType
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
            : "rounded-bl-md bg-chat-bot text-foreground"
        )}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
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
