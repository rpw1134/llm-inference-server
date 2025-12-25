from llama_cpp import Any, Dict, Llama
from llm_inference_server.types.model import ModelRequest, ModelParams
from typing import Generator, Iterable, cast, cast

def get_pretrained_model_instance(repo_id: str, filename: str, model_params: ModelParams) -> Llama:
    model = Llama.from_pretrained(repo_id=repo_id, filename=filename, **model_params.__dict__)
    return model

def get_local_model_instance(model_path: str, model_params: ModelParams) -> Llama:
    model = Llama(model_path=model_path, **model_params.__dict__)
    return model

def make_model_request(model_request: ModelRequest) -> str | Generator:
    # Get model instance based on local or pretrained
    model = get_pretrained_model_instance(model_request.repo_id, model_request.filename, model_request.model_params) if not model_request.local else get_local_model_instance(model_request.model_path, model_request.model_params)
    
    # Get response or generator based on streaming or not
    response = create_chat_completion(model, model_request.prompt) if not model_request.stream else stream_chat_completion(model, model_request.prompt)
    
    # Return response or generator
    return response

def create_chat_completion(model: Llama, prompt: str) -> str:
    response = model.create_chat_completion(messages=[{"role": "user", "content": prompt}])
    return str(response)

def stream_chat_completion(model: Llama, prompt: str) -> Generator:
    stream = cast(Iterable[Dict[str, Any]], model.create_chat_completion(
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    ))

    for chunk in stream:
        if not isinstance(chunk, dict):
            continue

        choices = chunk.get("choices")
        if not choices or not isinstance(choices, list):
            continue

        choice = choices[0] if len(choices) > 0 else {}
        if not isinstance(choice, dict):
            continue

        delta = choice.get("delta") or {}
        if not isinstance(delta, dict):
            continue

        content = delta.get("content")
        if isinstance(content, str) and content:
            print(content, end="", flush=True)
            yield content