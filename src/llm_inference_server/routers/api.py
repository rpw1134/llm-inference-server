from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from llm_inference_server.schemas.model import ModelRequestSchema
from llm_inference_server.services.chat_service import make_model_request
from typing import Generator

router = APIRouter(prefix="/api", tags=["api"])

@router.get("/status")
async def get_status():
    return {"status": "ok"}

@router.get("/info")
async def get_info():
    return {"info": "LLM Inference Server API"}

@router.post("/chat/completions")
async def chat_completions(model_request: ModelRequestSchema):
    response = make_model_request(model_request.data)
    if isinstance(response, Generator):
        return StreamingResponse(response, media_type="text/event-stream")
    return JSONResponse(content={"response": response})