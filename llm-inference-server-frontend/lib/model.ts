export type ModelParams = {
  n_gpu_layers: number;
  n_ctx: number;
  N_batch: number;
  temperature: number;
  top_p: number;
  top_k: number;
  repeat_penalty: number;
  max_tokens: number;
};

export type ModelRequestPayload = {
  model_params: ModelParams;
  prompt: string;
  local: boolean;
  model_path: string;
  repo_id: string;
  filename: string;
  stream: boolean;
};

export const defaultModelParams: ModelParams = {
  n_gpu_layers: -1,
  n_ctx: 512,
  N_batch: 512,
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40,
  repeat_penalty: 1.1,
  max_tokens: 2048,
};

export const defaultModelRequest: ModelRequestPayload = {
  model_params: defaultModelParams,
  prompt: "",
  local: false,
  model_path: "",
  repo_id: "Qwen/Qwen2.5-1.5B-Instruct-GGUF",
  filename: "qwen2.5-1.5b-instruct-q3_k_m.gguf",
  stream: true,
};
