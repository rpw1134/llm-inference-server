from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from llm_inference_server.schemas.model import ModelRequestSchema
from llm_inference_server.services.chat_service import make_model_request
from typing import Generator

router = APIRouter(prefix="/api", tags=["api"])

@router.get("/status")
async def get_status():
    """
    Health check endpoint.

    Returns:
        Simple status response indicating server is operational
    """
    return {"status": "ok"}

@router.get("/info")
async def get_info():
    """
    Get API information.

    Returns:
        Basic information about the LLM inference server
    """
    return {"info": "LLM Inference Server API"}

@router.post("/chat/completions")
async def chat_completions(model_request: ModelRequestSchema):
    """
    Generate chat completions with streaming or non-streaming response.

    Processes an LLM chat completion request and returns either:
    - StreamingResponse: Real-time token generation with performance metrics (if stream=True)
    - JSONResponse: Complete response after full generation (if stream=False)

    Request body should include:
    - model_params: Model configuration (context size, GPU layers, etc.)
    - repo_id/filename OR model_path: Model source
    - prompt: Input text to generate completion for
    - stream: Boolean flag for streaming mode

    Args:
        model_request: Validated request schema containing all model and inference parameters

    Returns:
        StreamingResponse with text/event-stream for streaming requests,
        or JSONResponse with complete response for non-streaming requests
    """
    response = make_model_request(model_request.data)
    if isinstance(response, Generator):
        return StreamingResponse(response, media_type="text/event-stream")
    return JSONResponse(content={"response": response.__dict__})