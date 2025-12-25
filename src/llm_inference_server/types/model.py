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
    