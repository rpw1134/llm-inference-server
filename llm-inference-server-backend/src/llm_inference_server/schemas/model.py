from pydantic import BaseModel
from llm_inference_server.types.model import ModelRequest
from llama_cpp import CreateChatCompletionResponse

class ModelRequestSchema(BaseModel):
    data : ModelRequest

class ModelResponseSchema(BaseModel):
    response : CreateChatCompletionResponse
    
class ModelStreamResponseSchema(BaseModel):
    response : CreateChatCompletionResponse