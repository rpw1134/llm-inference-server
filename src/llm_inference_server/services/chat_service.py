from llama_cpp import Llama
from llm_inference_server.types.model import ModelRequest, ModelParams

async def get_pretrained_model_instance(model_params: ModelParams) -> Llama:
    model = Llama.from_pretrained(repo_id=model_params.repo_id, filename=model_params.filename)
    return model

async def make_pretrained_model_request(model_request: ModelRequest) -> str:
    model = await get_pretrained_model_instance(model_request.model_params)
    response = model.create_chat_completion(messages=[{"role": "user", "content": model_request.prompt}])
    print("Model response:", response)
    return str(response)