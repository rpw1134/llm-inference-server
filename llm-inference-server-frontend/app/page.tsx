"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChatInput } from "../components/chat/ChatInput";
import { MessageBubble } from "../components/chat/MessageBubble";
import { SettingsModal } from "../components/settings/SettingsModal";
import { SettingsIcon } from "../components/icons/SettingsIcon";
import { InfoTooltip } from "../components/ui/InfoTooltip";
import { ModelRequestPayload, defaultModelRequest } from "../lib/model";
import { apiBase, postChatCompletion } from "../lib/api";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

// Backend response types matching schemas/model.py and types/model.py
type ChatCompletionResponse = {
  content: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  time_taken_seconds: number | null;
};

type StreamChunk = {
  num_input_tokens_processed?: number;
  num_input_tokens_processed_per_second?: number;
  content?: string;
  num_generated_tokens?: number;
  tokens_per_second?: number;
  curr_model_memory_mb?: number;
  first_token_time_seconds?: number;
  total_time_seconds?: number;
  max_model_memory_mb?: number;
};

type ModelResponseSchema = {
  response: ChatCompletionResponse;
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
        "Benchmark performance and system requirements of locally hosted GGUF models. Adjust model settings in the top-right. Note: each request is stateless and starts a new session.",
    },
  ]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [request, setRequest] =
    useState<ModelRequestPayload>(defaultModelRequest);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<InferenceMetrics | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const endpoint = useMemo(() => `${apiBase}/api/chat/completions`, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages]);

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
        const payload: ModelResponseSchema = await response.json();
        const text = extractAssistantText(payload);
        updateAssistantContent(assistantIndex, text || "No content returned.");

        // Update metrics from non-streaming response
        if (payload.response) {
          setMetrics({
            num_input_tokens_processed:
              payload.response.prompt_tokens ?? undefined,
            num_generated_tokens:
              payload.response.completion_tokens ?? undefined,
            total_time_seconds:
              payload.response.time_taken_seconds ?? undefined,
          });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
      updateAssistantContent(assistantIndex, `Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayload = (assistantIndex: number, payload: StreamChunk) => {
    // Handle content from stream chunk
    if (payload.content) {
      updateAssistantContent(assistantIndex, payload.content);
    }

    // Update metrics from stream chunk
    setMetrics((prev) => ({
      ...prev,
      ...(payload.num_input_tokens_processed !== undefined && {
        num_input_tokens_processed: payload.num_input_tokens_processed,
      }),
      ...(payload.num_input_tokens_processed_per_second !== undefined && {
        num_input_tokens_processed_per_second:
          payload.num_input_tokens_processed_per_second,
      }),
      ...(payload.num_generated_tokens !== undefined && {
        num_generated_tokens: payload.num_generated_tokens,
      }),
      ...(payload.tokens_per_second !== undefined && {
        tokens_per_second: payload.tokens_per_second,
      }),
      ...(payload.first_token_time_seconds !== undefined && {
        first_token_time_seconds: payload.first_token_time_seconds,
      }),
      ...(payload.total_time_seconds !== undefined && {
        total_time_seconds: payload.total_time_seconds,
      }),
      ...(payload.max_model_memory_mb !== undefined && {
        max_model_memory_mb: payload.max_model_memory_mb,
      }),
    }));
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

  const extractAssistantText = (payload: ModelResponseSchema): string => {
    // Extract content from non-streaming response
    // Backend returns: { response: ChatCompletionResponse }
    // where ChatCompletionResponse has a content field
    return payload.response?.content ?? "";
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-neutral-50">
      <div className="mx-auto flex w-full max-w-352 flex-1 flex-col gap-4 px-6 pb-12 pt-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">
              LLM Inference
            </p>
            <h1 className="text-3xl font-semibold text-neutral-100 mt-2">
              Chat Console
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Connected to {endpoint}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {error ? (
              <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-100">
                {error}
              </span>
            ) : (
              <span
                className={
                  isLoading
                    ? "rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-100"
                    : "rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-100"
                }
              >
                {isLoading ? "Running inference…" : "Ready"}
              </span>
            )}
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm font-semibold text-neutral-50 shadow-sm transition hover:border-orange-400 hover:shadow-orange-500/25"
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="flex h-160 w-full max-w-[66rem] flex-col gap-3 rounded-3xl border border-neutral-800 bg-neutral-950/85 p-5 shadow-2xl shadow-black/60">
              <div
                ref={messagesContainerRef}
                className="chat-scroll flex-1 space-y-3 overflow-y-auto rounded-2xl border border-neutral-900/70 bg-neutral-900/60 p-3"
              >
                {messages.map((message, index) => (
                  <MessageBubble
                    key={`${message.role}-${index}`}
                    role={message.role}
                    content={message.content}
                  />
                ))}
              </div>
              <ChatInput onSend={handleSend} disabled={isLoading} />
            </div>

            <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/85 p-4 text-sm text-neutral-200 lg:w-[24rem]">
              <div className="text-lg font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-4">
                Last run
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-neutral-100">
                <Metric
                  label="Input tokens"
                  value={metrics?.num_input_tokens_processed}
                  tooltip="Number of tokens in the input prompt that were processed by the model."
                />
                <Metric
                  label="Output tokens"
                  value={metrics?.num_generated_tokens}
                  tooltip="Number of output tokens generated by the model in the response."
                />
                <Metric
                  label="Tokens/ sec"
                  value={metrics?.tokens_per_second}
                  tooltip={
                    "Generation speed measured in tokens per second. Not available for batched response due to inability to properly differentiate prefill vs generation time."
                  }
                />
                <Metric
                  label="First token (s)"
                  value={metrics?.first_token_time_seconds}
                  tooltip="Time taken to generate the first token (prefill latency)."
                />
                <Metric
                  label="Time Taken (s)"
                  value={metrics?.total_time_seconds}
                  tooltip="Total time taken to complete the entire generation, including loading model weights and constructing KV cache."
                />
                <Metric
                  label="Max RAM (MB)"
                  value={metrics?.max_model_memory_mb}
                  tooltip="Maximum memory used by the model during inference. Includes memory used to load model weights."
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

type MetricProps = { label: string; value?: number; tooltip?: string };

function Metric({ label, value, tooltip }: MetricProps) {
  return (
    <div className="relative rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-2">
      {tooltip && (
        <div className="absolute right-2 top-2">
          <InfoTooltip content={tooltip} />
        </div>
      )}
      <div className="text-[15px] uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </div>
      <div className="font-semibold text-neutral-100 mt-3">{value ?? "–"}</div>
    </div>
  );
}
