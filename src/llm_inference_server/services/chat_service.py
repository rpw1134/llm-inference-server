import json
import os
from time import time
from math import floor
from typing import Generator, Iterable, Iterator, cast

import psutil
from llama_cpp import Any, Dict, Llama, CreateChatCompletionResponse

from llm_inference_server.types.model import ModelRequest, ModelParams

def get_pretrained_model_instance(repo_id: str, filename: str, model_params: ModelParams) -> Llama:
    model = Llama.from_pretrained(repo_id=repo_id, filename=filename, **model_params.__dict__)
    return model

def get_local_model_instance(model_path: str, model_params: ModelParams) -> Llama:
    model = Llama(model_path=model_path, **model_params.__dict__)
    return model

def make_model_request(model_request: ModelRequest) -> CreateChatCompletionResponse | Generator:
    # Get model instance based on local or pretrained
    model = get_pretrained_model_instance(model_request.repo_id, model_request.filename, model_request.model_params) if not model_request.local else get_local_model_instance(model_request.model_path, model_request.model_params)
    
    # Get response or generator based on streaming or not
    response = create_chat_completion(model, model_request.prompt) if not model_request.stream else stream_chat_completion(model, model_request.prompt)
    
    # Return response or generator
    return response

def create_chat_completion(model: Llama, prompt: str) -> CreateChatCompletionResponse:
    response = model.create_chat_completion(messages=[{"role": "user", "content": prompt}])
    print(type(response))
    if isinstance(response, Iterator):
        raise ValueError("Invalid response from model")
    return response

def stream_chat_completion(model: Llama, prompt: str) -> Generator[str, None, None]:
    # Before prefill time
    before_prefill_time = time()
    
    # Get process mem before model inference
    process = psutil.Process(os.getpid())
    start_memory_mb = process.memory_info().rss / (1024 * 1024)
    
    # Get iterator and prefill
    stream = cast(Iterable[Dict[str, Any]], model.create_chat_completion(
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    ))
    
    # Time taken to prefill
    time_to_prefill = time() - before_prefill_time
    
    # Calculate input tokens per second
    num_prompt_tokens = len(model.tokenize(bytes(prompt, "utf-8")))
    num_input_tokens_processed_per_second = floor(num_prompt_tokens / time_to_prefill if time_to_prefill > 0 else 0)
    
    # Set max model usage to 0
    max_memory_mb = 0
    
    # Get timing info
    start_time = time()
    first_token_time = None
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
            if first_token_time is None:
                first_token_time = time() - start_time
            num_generated_tokens += 1
            tokens_per_second = floor(num_generated_tokens / (time() - start_time) if (time() - start_time) > 0 else 0)
            curr_model_memory_mb = (process.memory_info().rss / (1024 * 1024))- start_memory_mb
            max_memory_mb = max(max_memory_mb, curr_model_memory_mb)

            # Construct return body
            return_body = {
                "content": content,
                "num_generated_tokens": num_generated_tokens,
                "tokens_per_second": tokens_per_second,
                "curr_model_memory_mb": curr_model_memory_mb,
                "first_token_time_seconds": first_token_time,
            }
            
            yield f"{json.dumps(return_body)}"

    end_time = time()
    return_body = {
        "num_input_tokens_processed": num_prompt_tokens,
        "num_input_tokens_processed_per_second": num_input_tokens_processed_per_second,
        "num_generated_tokens": num_generated_tokens,
        "total_time_seconds": end_time - start_time,
        "first_token_time_seconds": first_token_time,
        "max_model_memory_mb": max_memory_mb,
    }
    yield f"{json.dumps(return_body)}"