export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
        <div className="h-4 w-4 rounded-full bg-primary/60 animate-pulse" />
      </div>
      <div className="rounded-2xl rounded-bl-md bg-chat-bot px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-[bounce_1.4s_infinite_0ms]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-[bounce_1.4s_infinite_200ms]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-[bounce_1.4s_infinite_400ms]" />
        </div>
      </div>
    </div>
  )
}
