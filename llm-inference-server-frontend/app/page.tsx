"use client";

import { useMemo, useState } from "react";
import { ChatInput } from "../components/chat/ChatInput";
import { MessageBubble } from "../components/chat/MessageBubble";
import { SettingsModal } from "../components/settings/SettingsModal";
import { SettingsIcon } from "../components/icons/SettingsIcon";
import { ModelRequestPayload, defaultModelRequest } from "../lib/model";
import { apiBase, postChatCompletion } from "../lib/api";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type InferenceMetrics = {
  num_input_tokens_processed?: number;
  num_generated_tokens?: number;
  tokens_per_second?: number;
  total_time_seconds?: number;
  first_token_time_seconds?: number;
  max_model_memory_mb?: number;
  num_input_tokens_processed_per_second?: number;
};

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "system",
      content:
        "Chat with your local or remote GGUF models. Adjust ModelRequest settings in the top-right and send a prompt to stream tokens.",
    },
  ]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [request, setRequest] =
    useState<ModelRequestPayload>(defaultModelRequest);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<InferenceMetrics | null>(null);

  const endpoint = useMemo(() => `${apiBase}/api/chat/completions`, []);

  const updateAssistantContent = (assistantIndex: number, append: string) => {
    setMessages((prev) => {
      const next = [...prev];
      const existing = next[assistantIndex];
      if (existing) {
        next[assistantIndex] = {
          ...existing,
          content: `${existing.content}${append}`,
        };
      }
      return next;
    });
  };

  const handleSend = async (prompt: string) => {
    if (isLoading) return;
    setError(null);
    setMetrics(null);
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: prompt },
      { role: "assistant", content: "" },
    ]);
    setIsLoading(true);

    try {
      const response = await postChatCompletion({ ...request, prompt });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Request failed");
      }

      if (request.stream) {
        await consumeStream(response, assistantIndex);
      } else {
        const payload = await response.json();
        const text = extractAssistantText(payload.response ?? payload);
        updateAssistantContent(assistantIndex, text || "No content returned.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
      updateAssistantContent(assistantIndex, `Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayload = (assistantIndex: number, payload: any) => {
    if (typeof payload !== "object" || payload === null) return;
    if (typeof payload.content === "string") {
      updateAssistantContent(assistantIndex, payload.content);
    }
    setMetrics((prev) => ({ ...prev, ...payload }));
  };

  const consumeStream = async (response: Response, assistantIndex: number) => {
    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // The backend yields standalone JSON objects per chunk. We parse each intact object and keep leftovers in the buffer.
      const parts = buffer.split("\n").filter(Boolean);
      buffer = "";
      for (const part of parts) {
        try {
          const parsed = JSON.parse(part.trim());
          handlePayload(assistantIndex, parsed);
        } catch {
          buffer += part; // keep any partial JSON and wait for the next chunk
        }
      }
    }

    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer.trim());
        handlePayload(assistantIndex, parsed);
      } catch {
        updateAssistantContent(assistantIndex, "\n[stream parse error]\n");
      }
    }
  };

  const extractAssistantText = (raw: any): string => {
    if (!raw) return "";
    if (typeof raw === "string") return raw;
    const choice = raw.choices?.[0];
    if (choice?.message?.content) return choice.message.content as string;
    if (choice?.delta?.content) return choice.delta.content as string;
    if (raw.response?.content) return String(raw.response.content);
    return JSON.stringify(raw);
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-6 pb-12 pt-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">
              LLM Inference
            </p>
            <h1 className="text-3xl font-semibold text-white">Chat Console</h1>
            <p className="text-sm text-slate-400">Connected to {endpoint}</p>
          </div>
          <div className="flex items-center gap-3">
            {error ? (
              <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-medium text-rose-200">
                {error}
              </span>
            ) : (
              <span
                className={
                  isLoading
                    ? "rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-200"
                    : "rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-200"
                }
              >
                {isLoading ? "Running inference…" : "Ready"}
              </span>
            )}
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:border-orange-400 hover:shadow-orange-500/25"
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-3xl border border-slate-800 bg-neutral-950/80 p-5 shadow-2xl shadow-black/60">
            {messages.map((message, index) => (
              <MessageBubble
                key={`${message.role}-${index}`}
                role={message.role}
                content={message.content}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-start">
            <div className="flex-1">
              <ChatInput onSend={handleSend} disabled={isLoading} />
            </div>
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-slate-800 bg-neutral-950/80 p-4 text-sm text-slate-200 md:w-72">
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Last run
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-100">
                <Metric
                  label="Input tokens"
                  value={metrics?.num_input_tokens_processed}
                />
                <Metric
                  label="Output tokens"
                  value={metrics?.num_generated_tokens}
                />
                <Metric label="Tokens/sec" value={metrics?.tokens_per_second} />
                <Metric
                  label="First token (s)"
                  value={metrics?.first_token_time_seconds}
                />
                <Metric
                  label="Total time (s)"
                  value={metrics?.total_time_seconds}
                />
                <Metric
                  label="Max RAM (MB)"
                  value={metrics?.max_model_memory_mb}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        value={request}
        onChange={setRequest}
      />
    </div>
  );
}

type MetricProps = { label: string; value?: number };

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
        {label}
      </div>
      <div className="text-sm font-semibold text-white">{value ?? "–"}</div>
    </div>
  );
}
