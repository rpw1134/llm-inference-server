from dataclasses import dataclass


@dataclass
class ModelRequest:
    model_params: 'ModelParams'
    prompt: str
    local: bool = False
    model_path: str = ""
    repo_id: str = ""
    filename: str = ""
    stream: bool = False
    
@dataclass
class ModelParams:
    n_gpu_layers: int = -1
    n_ctx: int = 512
    N_batch: int = 512
    temperature: float = 0.7
    top_p: float = 0.9
    top_k: int = 40
    repeat_penalty: float = 1.1
    max_tokens: int = 2048
    
@dataclass
class ChatCompletionResponse:
    content: str | None
    prompt_tokens: int | None
    completion_tokens: int | None
    total_tokens: int | None
    time_taken_seconds: float | None

@dataclass
class StreamChunk:
    num_input_tokens_processed: int | None = None
    num_input_tokens_processed_per_second: float | None = None
    content: str | None = None
    num_generated_tokens: int | None = None
    tokens_per_second: float | None = None
    curr_model_memory_mb: float | None = None
    first_token_time_seconds: float | None = None
    total_time_seconds: float | None = None
    max_model_memory_mb: float | None = None