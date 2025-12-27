"use client";

import { CloseIcon } from "../icons/CloseIcon";
import { TextInputField, SliderInputField } from "./InputField";
import { ModelRequestPayload } from "../../lib/model";

const textInputs: {
  key: keyof Pick<ModelRequestPayload, "repo_id" | "filename" | "model_path">;
  label: string;
  placeholder?: string;
  tooltip?: string;
  helpText?: string;
}[] = [
  {
    key: "repo_id",
    label: "Hugging Face Repo ID",
    placeholder: "Qwen/Qwen2.5-1.5B-Instruct-GGUF",
    tooltip:
      "HuggingFace repository ID containing the GGUF model file. Upon first request to a model, will download the model file to your local huggingface cache.",
  },
  {
    key: "filename",
    label: "Filename",
    placeholder: "qwen2.5-1.5b-instruct-q3_k_m.gguf",
    tooltip:
      "Specific GGUF model file name in the repository. Upon first request to a model, will download the model file to your local huggingface cache.",
  },
  {
    key: "model_path",
    label: "Local model path",
    placeholder: "/absolute/path/to/model.gguf",
    tooltip:
      "Absolute path to a local GGUF model file on disk (used when 'Use local model' is enabled)",
  },
];

const sliderInputs: {
  key: keyof ModelRequestPayload["model_params"];
  label: string;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
}[] = [
  {
    key: "n_gpu_layers",
    label: "GPU layers",
    min: -1,
    max: 200,
    step: 1,
    tooltip:
      "Number of model layers to offload to GPU. Use -1 for all layers, 0 for CPU only. Adjust based on your GPU memory capacity. ",
  },
  {
    key: "n_ctx",
    label: "Context length",
    min: 64,
    max: 8192,
    step: 64,
    tooltip:
      "Maximum context window size in tokens for the model. In the case your context window selected exceeds model capability, it will be capped to the model's maximum supported context length.",
  },
  {
    key: "N_batch",
    label: "Batch size",
    min: 1,
    max: 2048,
    step: 8,
    tooltip:
      "Number of tokens to process in parallel during prefill and KV cache construction.",
  },
  {
    key: "temperature",
    label: "Temperature",
    min: 0,
    max: 2,
    step: 0.05,
    tooltip:
      "Controls randomness. Lower values make output more focused and deterministic, higher values more creative and random.",
  },
  {
    key: "top_p",
    label: "Top P",
    min: 0,
    max: 1,
    step: 0.05,
    tooltip:
      "Nucleus sampling threshold. Only tokens with cumulative probability up to this value are considered. Applied with respect to Top K outputs (redistributed probability).",
  },
  {
    key: "top_k",
    label: "Top K",
    min: 1,
    max: 200,
    step: 1,
    tooltip:
      "Limits token selection to the K most likely tokens at each step. Applied before Top P filtering.",
  },
  {
    key: "repeat_penalty",
    label: "Repeat penalty",
    min: 0,
    max: 2,
    step: 0.05,
    tooltip:
      "Penalty for repeating tokens. Higher values reduce repetition in the output.",
  },
  {
    key: "max_tokens",
    label: "Max tokens",
    min: 32,
    max: 4096,
    step: 16,
    tooltip: "Maximum number of tokens to generate in the response.",
  },
];

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
  value: ModelRequestPayload;
  onChange: (next: ModelRequestPayload) => void;
};

export function SettingsModal({
  open,
  onClose,
  value,
  onChange,
}: SettingsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl shadow-black/60">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
          aria-label="Close settings"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Inference Request
            </p>
            <h2 className="text-xl font-semibold text-neutral-50 mt-2">
              Tune Inference Parameters
            </h2>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/75 px-4 py-3 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <input
                id="stream-toggle"
                type="checkbox"
                checked={value.stream}
                onChange={(e) =>
                  onChange({ ...value, stream: e.target.checked })
                }
                className="h-4 w-4 accent-orange-400"
              />
              <label htmlFor="stream-toggle">Stream tokens</label>
            </div>
            <span className="h-5 w-px bg-neutral-800" />
            <div className="flex items-center gap-2">
              <input
                id="local-toggle"
                type="checkbox"
                checked={value.local}
                onChange={(e) =>
                  onChange({ ...value, local: e.target.checked })
                }
                className="h-4 w-4 accent-orange-400"
              />
              <label htmlFor="local-toggle">Use local model</label>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {textInputs.slice(0, 2).map((input) => (
                <TextInputField
                  key={input.key}
                  label={input.label}
                  value={value[input.key]}
                  onChange={(newValue) =>
                    onChange({ ...value, [input.key]: newValue })
                  }
                  placeholder={input.placeholder}
                  tooltip={input.tooltip}
                  disabled={value.local}
                />
              ))}
            </div>
            {textInputs.slice(2).map((input) => (
              <TextInputField
                key={input.key}
                label={input.label}
                value={value[input.key]}
                onChange={(newValue) =>
                  onChange({ ...value, [input.key]: newValue })
                }
                placeholder={input.placeholder}
                tooltip={input.tooltip}
                helpText={input.helpText}
                disabled={!value.local}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 text-sm text-neutral-200">
            <div className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
              Summary
            </div>
            <ul className="mt-3 space-y-2 text-sm text-neutral-300">
              <li>
                <span className="text-neutral-400">Repo:</span>{" "}
                {value.repo_id || "—"}
              </li>
              <li>
                <span className="text-neutral-400">Filename:</span>{" "}
                {value.filename || "—"}
              </li>
              <li>
                <span className="text-neutral-400">Local path:</span>{" "}
                {value.model_path || "—"}
              </li>
              <li>
                <span className="text-neutral-400">Stream:</span>{" "}
                {value.stream ? "On" : "Off"}
              </li>
              <li>
                <span className="text-neutral-400">Source:</span>{" "}
                {value.local ? "Local" : "HuggingFace"}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sliderInputs.map((input) => (
            <SliderInputField
              key={input.key}
              label={input.label}
              value={value.model_params[input.key]}
              onChange={(newValue) =>
                onChange({
                  ...value,
                  model_params: {
                    ...value.model_params,
                    [input.key]: newValue,
                  },
                })
              }
              min={input.min}
              max={input.max}
              step={input.step}
              tooltip={input.tooltip}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
