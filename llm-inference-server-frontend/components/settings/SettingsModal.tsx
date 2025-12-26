"use client";

import { CloseIcon } from "../icons/CloseIcon";
import { ModelRequestPayload } from "../../lib/model";

const numberInputs: { key: keyof ModelRequestPayload["model_params"]; label: string; min?: number; max?: number; step?: number }[] = [
  { key: "n_gpu_layers", label: "GPU layers", min: -1, max: 200, step: 1 },
  { key: "n_ctx", label: "Context length", min: 64, max: 8192, step: 64 },
  { key: "N_batch", label: "Batch size", min: 1, max: 2048, step: 8 },
  { key: "temperature", label: "Temperature", min: 0, max: 2, step: 0.05 },
  { key: "top_p", label: "Top P", min: 0, max: 1, step: 0.05 },
  { key: "top_k", label: "Top K", min: 1, max: 200, step: 1 },
  { key: "repeat_penalty", label: "Repeat penalty", min: 0, max: 2, step: 0.05 },
  { key: "max_tokens", label: "Max tokens", min: 32, max: 4096, step: 16 },
];

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
  value: ModelRequestPayload;
  onChange: (next: ModelRequestPayload) => void;
};

export function SettingsModal({ open, onClose, value, onChange }: SettingsModalProps) {
  if (!open) return null;

  const handleParamChange = (key: keyof ModelRequestPayload["model_params"], raw: string) => {
    const parsed = Number(raw);
    onChange({
      ...value,
      model_params: { ...value.model_params, [key]: Number.isNaN(parsed) ? value.model_params[key] : parsed },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Close settings"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Model request</p>
            <h2 className="text-xl font-semibold text-white">Tune inference parameters</h2>
            <p className="text-sm text-slate-400">Mirror of the backend ModelRequest. Every change is saved for the next request.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <input
                id="stream-toggle"
                type="checkbox"
                checked={value.stream}
                onChange={(e) => onChange({ ...value, stream: e.target.checked })}
                className="h-4 w-4 accent-indigo-400"
              />
              <label htmlFor="stream-toggle">Stream tokens</label>
            </div>
            <span className="h-5 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <input
                id="local-toggle"
                type="checkbox"
                checked={value.local}
                onChange={(e) => onChange({ ...value, local: e.target.checked })}
                className="h-4 w-4 accent-indigo-400"
              />
              <label htmlFor="local-toggle">Use local model</label>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-200">
                <span className="block text-slate-300">Repo ID</span>
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                  value={value.repo_id}
                  onChange={(e) => onChange({ ...value, repo_id: e.target.value })}
                  placeholder="Qwen/Qwen2.5-1.5B-Instruct-GGUF"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-200">
                <span className="block text-slate-300">Filename</span>
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                  value={value.filename}
                  onChange={(e) => onChange({ ...value, filename: e.target.value })}
                  placeholder="qwen2.5-1.5b-instruct-q3_k_m.gguf"
                />
              </label>
            </div>
            <label className="space-y-2 text-sm font-medium text-slate-200">
              <span className="block text-slate-300">Local model path</span>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                value={value.model_path}
                onChange={(e) => onChange({ ...value, model_path: e.target.value })}
                placeholder="/models/llama.bin (used when Local is on)"
              />
              <p className="text-xs font-normal text-slate-500">When local is enabled, repo_id and filename are ignored and model_path is used instead.</p>
            </label>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
            <div className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Summary</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><span className="text-slate-400">Repo:</span> {value.repo_id || "—"}</li>
              <li><span className="text-slate-400">Filename:</span> {value.filename || "—"}</li>
              <li><span className="text-slate-400">Local path:</span> {value.model_path || "—"}</li>
              <li><span className="text-slate-400">Stream:</span> {value.stream ? "On" : "Off"}</li>
              <li><span className="text-slate-400">Source:</span> {value.local ? "Local" : "HuggingFace"}</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {numberInputs.map((input) => (
            <label key={input.key} className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>{input.label}</span>
                <span className="text-xs text-slate-500">{value.model_params[input.key]}</span>
              </div>
              <input
                type="range"
                min={input.min}
                max={input.max}
                step={input.step}
                value={value.model_params[input.key]}
                onChange={(e) => handleParamChange(input.key, e.target.value)}
                className="w-full accent-indigo-400"
              />
              <input
                type="number"
                min={input.min}
                max={input.max}
                step={input.step}
                value={value.model_params[input.key]}
                onChange={(e) => handleParamChange(input.key, e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-sm text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
