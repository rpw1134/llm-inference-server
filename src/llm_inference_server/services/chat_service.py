from llama_cpp import Llama
from llm_inference_server.types.model import ModelRequest, ModelParams

def get_pretrained_model_instance(repo_id: str, filename: str, model_params: ModelParams) -> Llama:
    model = Llama.from_pretrained(repo_id=repo_id, filename=filename, **model_params.__dict__)
    return model

def get_local_model_instance(model_path: str, model_params: ModelParams) -> Llama:
    model = Llama(model_path=model_path, **model_params.__dict__)
    return model

def make_pretrained_model_request(model_request: ModelRequest) -> str:
    model = get_pretrained_model_instance(model_request.repo_id, model_request.filename, model_request.model_params) if not model_request.local else get_local_model_instance(model_request.model_path, model_request.model_params)
    response = model.create_chat_completion(messages=[{"role": "user", "content": model_request.prompt}])
    print("Model response:", response)
    return str(response)

def create_chat_completion(model: Llama, prompt: str) -> str:
    response = model.create_chat_completion(messages=[{"role": "user", "content": prompt}])
    return str(response)

def stream_chat_completion(model: Llama, prompt: str):
    for response in model.create_chat_completion(messages=[{"role": "user", "content": prompt}], stream=True):
        yield str(response)