"use client";

import { useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-end gap-3 rounded-2xl border border-slate-800 bg-neutral-950/70 p-4 shadow-lg shadow-black/50"
    >
      <textarea
        className="min-h-[80px] flex-1 resize-none rounded-xl border border-slate-800 bg-neutral-950/90 p-3 text-sm text-slate-50 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
        placeholder="Ask anything about your model…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 text-sm font-semibold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
