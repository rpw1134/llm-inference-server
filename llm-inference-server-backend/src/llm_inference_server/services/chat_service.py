import json
import os
from time import time
from typing import Any, Dict, Generator, Iterable, Iterator, cast

import psutil
from llama_cpp import Llama

from llm_inference_server.types.model import ChatCompletionResponse, ModelRequest, ModelParams, StreamChunk

def get_pretrained_model_instance(repo_id: str, filename: str, model_params: ModelParams) -> Llama:
    """
    Load a pretrained model from HuggingFace repository.

    Args:
        repo_id: HuggingFace repository ID (e.g., "Qwen/Qwen2.5-1.5B-Instruct-GGUF")
        filename: Model file name in the repository (e.g., "qwen2.5-1.5b-instruct-q3_k_m.gguf")
        model_params: Model configuration parameters (context size, GPU layers, etc.)

    Returns:
        Loaded Llama model instance ready for inference
    """
    model = Llama.from_pretrained(repo_id=repo_id, filename=filename, **model_params.__dict__)
    return model

def get_local_model_instance(model_path: str, model_params: ModelParams) -> Llama:
    """
    Load a model from local filesystem.

    Args:
        model_path: Absolute or relative path to the model file on disk
        model_params: Model configuration parameters (context size, GPU layers, etc.)

    Returns:
        Loaded Llama model instance ready for inference
    """
    model = Llama(model_path=model_path, **model_params.__dict__)
    return model

def get_model_instance(model_request: ModelRequest) -> Llama:
    """
    Load a model instance based on request configuration.

    Routes to either local or pretrained model loading based on request.local flag.

    Args:
        model_request: Complete model request containing source info and parameters

    Returns:
        Loaded Llama model instance from either local filesystem or HuggingFace
    """
    if model_request.local:
        return get_local_model_instance(model_request.model_path, model_request.model_params)
    else:
        return get_pretrained_model_instance(model_request.repo_id, model_request.filename, model_request.model_params)

def make_model_request(model_request: ModelRequest) -> ChatCompletionResponse | Generator[str, None, None]:
    """
    Execute a chat completion request with either streaming or non-streaming response.

    Routes to appropriate handler based on model_request.stream flag.

    Args:
        model_request: Complete request including prompt, model info, and streaming preference

    Returns:
        Either a ChatCompletionResponse with content and metrics or a generator yielding JSON chunks
    """
    # Get response or generator based on streaming or not
    response = create_chat_completion(model_request=model_request) if not model_request.stream else stream_chat_completion(model_request=model_request)

    # Return response or generator
    return response

def create_chat_completion(model_request: ModelRequest) -> ChatCompletionResponse:
    """
    Generate a complete chat completion response (non-streaming).

    Loads the model, processes the prompt, and returns the full completion with metrics.

    Args:
        model_request: Request containing prompt and model configuration

    Returns:
        ChatCompletionResponse containing:
            - content: Generated response text
            - prompt_tokens: Number of tokens in the prompt
            - completion_tokens: Number of tokens in the completion
            - total_tokens: Total tokens used
            - time_taken_seconds: Time taken to generate the response

    Raises:
        ValueError: If model unexpectedly returns a streaming response
    """
    prompt = model_request.prompt
    model = get_model_instance(model_request)

    # Track start time
    start_time = time()

    response = model.create_chat_completion(messages=[{"role": "user", "content": prompt}])

    # Track end time
    end_time = time()
    time_taken = end_time - start_time

    if isinstance(response, Iterator):
        raise ValueError("Invalid response from model")

    # Extract content and metrics
    content = response["choices"][0]["message"]["content"]
    usage = response["usage"]

    return ChatCompletionResponse(
        content=content,
        prompt_tokens=usage["prompt_tokens"],
        completion_tokens=usage["completion_tokens"],
        total_tokens=usage["total_tokens"],
        time_taken_seconds=round(time_taken, 3),
    )

def stream_chat_completion(model_request: ModelRequest) -> Generator[str, None, None]:
    """
    Generate a streaming chat completion with real-time metrics.

    Streams tokens as they're generated with performance metrics including:
    - Tokens per second (generation speed)
    - Time to first token (prefill latency)
    - Memory usage delta (inference overhead)
    - Input token processing speed

    The generator yields JSON-encoded chunks in this order:
    1. Initial chunk with input token metrics
    2. Content chunks with each generated token and running metrics
    3. Final chunk with complete summary statistics

    Args:
        model_request: Request containing prompt and model configuration

    Yields:
        JSON-encoded strings containing either content or metrics
    """

    # Extract prompt
    prompt = model_request.prompt
    
    # Before prefill time
    before_prefill_time = time()
    
    # Get process mem before model inference
    process = psutil.Process(os.getpid())
    start_memory_mb = process.memory_info().rss / (1024 * 1024)
    
    # Load model instance into memory
    model = get_model_instance(model_request)
    
    # Get iterator and prefill
    stream = cast(Iterable[Dict[str, Any]], model.create_chat_completion(
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    ))
    
    # Time taken to prefill
    time_to_prefill = time() - before_prefill_time
    
    # Calculate input tokens per second
    num_prompt_tokens = len(model.tokenize(bytes(prompt, "utf-8")))
    num_input_tokens_processed_per_second = num_prompt_tokens / time_to_prefill if time_to_prefill > 0 else 0
    
    # Set max model usage to 0
    max_memory_mb = 0
    
    # Get timing info
    start_time = time()
    first_token_time = 0
    num_generated_tokens = 0
    
    initial_return_body = {
        "num_input_tokens_processed": num_prompt_tokens,
        "num_input_tokens_processed_per_second": num_input_tokens_processed_per_second,
    }
    
    # Yield initial info
    yield f"{json.dumps(initial_return_body)}"

    for chunk in stream:
        
        # Linter guardrails
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
            # Update metrics, return current ones
            if first_token_time == 0:
                first_token_time = time() - start_time
            num_generated_tokens += 1
            tokens_per_second = num_generated_tokens / (time() - start_time) if (time() - start_time) > 0 else 0
            curr_model_memory_mb = (process.memory_info().rss / (1024 * 1024))- start_memory_mb
            max_memory_mb = max(max_memory_mb, curr_model_memory_mb)

            # Construct return body
            return_body = {
                "content": content,
                "num_generated_tokens": num_generated_tokens,
                "tokens_per_second": round(tokens_per_second, 3),
                "curr_model_memory_mb": round(curr_model_memory_mb, 3),
                "first_token_time_seconds": round(first_token_time, 3),
            }
            
            yield f"{json.dumps(return_body)}"

    # Final time for benchmarking
    end_time = time()
    
    # Clean up model from memory
    del model
    
    return_body = {
        "total_time_seconds": round(end_time - before_prefill_time, 3),
        "max_model_memory_mb": round(max_memory_mb, 3),
    }
    yield f"{json.dumps(return_body)}"