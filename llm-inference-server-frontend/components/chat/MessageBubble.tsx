type ChatMessageProps = {
  role: "user" | "assistant" | "system";
  content: string;
};

const roleStyles: Record<ChatMessageProps["role"], string> = {
  user: "bg-neutral-900 text-neutral-50 border border-neutral-700",
  assistant: "bg-neutral-950/70 text-neutral-50 border border-neutral-800",
  system: "bg-orange-500/10 text-orange-50 border border-orange-400/40",
};

const roleLabel: Record<ChatMessageProps["role"], string> = {
  user: "You",
  assistant: "Model",
  system: "System",
};

export function MessageBubble({ role, content }: ChatMessageProps) {
  return (
    <div className={`w-full rounded-2xl p-4 shadow-sm ${roleStyles[role]}`}>
      <div className="mb-2 text-xs uppercase tracking-widest text-neutral-500">
        {roleLabel[role]}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-100">
        {content || "…"}
      </p>
    </div>
  );
}
