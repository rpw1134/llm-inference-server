from dataclasses import dataclass


@dataclass
class ModelRequest:
    model_params: 'ModelParams'
    prompt: str
    
@dataclass
class ModelParams:
    repo_id: str
    filename: str