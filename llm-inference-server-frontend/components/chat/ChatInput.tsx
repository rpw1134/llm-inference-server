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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, allow Shift+Enter for new lines
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event as unknown as React.FormEvent);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-end gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/75 p-4 shadow-lg shadow-black/50"
    >
      <textarea
        className="min-h-20 flex-1 resize-none rounded-xl border border-neutral-800 bg-neutral-950/90 p-3 text-sm text-neutral-50 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
        placeholder="Ask anything about your model…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="h-11 rounded-xl bg-linear-to-r from-orange-500 to-amber-400 px-4 text-sm font-semibold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
