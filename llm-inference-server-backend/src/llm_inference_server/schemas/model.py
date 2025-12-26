from pydantic import BaseModel
from llm_inference_server.types.model import ModelRequest

class ModelRequestSchema(BaseModel):
    data : ModelRequest