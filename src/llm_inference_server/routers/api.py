from fastapi import APIRouter
from llm_inference_server.schemas.model import ModelRequestSchema
from llm_inference_server.services.chat_service import make_pretrained_model_request

router = APIRouter(prefix="/api", tags=["api"])

@router.get("/status")
async def get_status():
    return {"status": "ok"}

@router.get("/info")
async def get_info():
    return {"info": "LLM Inference Server API"}

@router.post("/completions/chat")
async def chat_completions(model_request: ModelRequestSchema):
    response = await make_pretrained_model_request(model_request.data)
    return {"response": response}