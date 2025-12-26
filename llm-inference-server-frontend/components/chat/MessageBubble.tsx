type ChatMessageProps = {
  role: "user" | "assistant" | "system";
  content: string;
};

const roleStyles: Record<ChatMessageProps["role"], string> = {
  user: "bg-slate-800 text-slate-50 border border-slate-700",
  assistant: "bg-white/5 text-slate-50 border border-slate-800",
  system: "bg-amber-100/10 text-amber-50 border border-amber-200/30",
};

const roleLabel: Record<ChatMessageProps["role"], string> = {
  user: "You",
  assistant: "Model",
  system: "System",
};

export function MessageBubble({ role, content }: ChatMessageProps) {
  return (
    <div className={`w-full rounded-2xl p-4 shadow-sm ${roleStyles[role]}`}>
      <div className="mb-2 text-xs uppercase tracking-widest text-slate-400">
        {roleLabel[role]}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
        {content || "…"}
      </p>
    </div>
  );
}
