# LLM Inference Server

A full-stack application for benchmarking quantized GGUF models on MacBook using llama-cpp with Metal acceleration. This project provides a FastAPI backend for model inference and a Next.js frontend for interactive testing and performance analysis.

## Purpose

This project is designed to benchmark and analyze the performance of locally hosted GGUF models, specifically optimized for MacBook hardware using llama-cpp's Metal backend. It helps you:

- Measure real-world inference performance of quantized models
- Compare different quantization levels (Q3_K_M, Q4_K_M, Q5_K_M, etc.)
- Understand hardware limitations and memory requirements
- Analyze token generation speeds and latency metrics
- Test models before deploying them in production

## Features

### Backend (FastAPI)

- **Model Loading**: Support for both HuggingFace repository models and local GGUF files
- **Streaming & Non-streaming**: Real-time token generation or batched responses
- **Performance Metrics**: Detailed tracking of:
  - Tokens per second (generation speed)
  - Time to first token (prefill latency)
  - Memory usage during inference
  - Input token processing speed
  - Total generation time
- **Metal Acceleration**: Utilizes MacBook GPU via llama-cpp-python with Metal backend
- **Flexible Configuration**: Adjustable context size, GPU layers, and model parameters

### Frontend (Next.js)

- **Interactive Chat Interface**: Test models with a conversational UI
- **Real-time Metrics Dashboard**: Live performance statistics during inference
- **Settings Panel**: Configure model parameters without restarting
  - Model selection (HuggingFace or local path)
  - Context window size
  - GPU layer allocation
  - Streaming vs batched mode
- **Responsive Design**: Modern UI built with Tailwind CSS

## Architecture

```
llm-inference-server/
├── llm-inference-server-backend/     # FastAPI server
│   ├── src/
│   │   └── llm_inference_server/
│   │       ├── main.py               # FastAPI application
│   │       ├── routers/
│   │       │   └── api.py            # API endpoints
│   │       ├── services/
│   │       │   └── chat_service.py   # Model loading and inference
│   │       ├── schemas/              # Request/response schemas
│   │       └── types/                # Type definitions
│   ├── pyproject.toml                # Python dependencies
│   └── uv.lock
│
└── llm-inference-server-frontend/    # Next.js app
    ├── app/
    │   ├── page.tsx                  # Main chat interface
    │   └── layout.tsx                # App layout
    ├── components/
    │   ├── chat/                     # Chat UI components
    │   ├── settings/                 # Settings modal
    │   └── ui/                       # Shared UI components
    ├── lib/                          # API client and utilities
    ├── package.json                  # Node dependencies
    └── next.config.ts
```

## Setup

### Prerequisites

- macOS (for Metal GPU acceleration)
- Python 3.12+
- Node.js 20+
- [uv](https://github.com/astral-sh/uv) - Fast Python package installer

### Backend Setup

1. Navigate to the backend directory:

```bash
cd llm-inference-server-backend
```

2. Install dependencies using uv:

```bash
uv install
```

3. Start the development server:

```bash
uv run dev
```

The backend will start on `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd llm-inference-server-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`.

## Usage

### Running the Application

1. Start the backend server (in one terminal):

```bash
cd llm-inference-server-backend
uv run dev
```

2. Start the frontend (in another terminal):

```bash
cd llm-inference-server-frontend
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Testing Models

#### Using HuggingFace Models

1. Click the "Settings" button in the top-right corner
2. Enter a HuggingFace repository ID (e.g., `Qwen/Qwen2.5-1.5B-Instruct-GGUF`)
3. Enter the filename (e.g., `qwen2.5-1.5b-instruct-q3_k_m.gguf`)
4. Adjust context size and GPU layers as needed
5. Click "Save Settings"
6. Start chatting to benchmark the model

#### Using Local Models

1. Click the "Settings" button
2. Toggle "Use Local Model"
3. Enter the absolute path to your GGUF file
4. Configure other parameters
5. Click "Save Settings"
6. Start chatting to benchmark the model

#### A Note About Chats

Chats are designed simply for model benchmarking. There is not session storage, and each request is stateless meaning your chats will not have history.

#### A Note on Error Handling

The goal of this project was to explore model benchmarking and learn about transformer architectures. There is no robust error handling or popup messages for the front end. If there is a failure, use the console to see.

### Understanding Metrics

The dashboard displays real-time performance metrics:

- **Input tokens**: Number of tokens in your prompt
- **Output tokens**: Number of tokens generated in the response
- **Tokens/sec**: Generation speed (higher is better)
- **First token (s)**: Prefill latency - time to first token (lower is better)
- **Time Taken (s)**: Total generation time including model loading
- **Max RAM (MB)**: Peak memory usage during inference

### Streaming vs Batched Mode

- **Streaming**: Tokens appear in real-time, provides detailed metrics during generation
- **Batched**: Complete response returned at once, faster for short responses

## API Endpoints

### POST `/api/chat/completions`

Generate chat completions with performance metrics.

Request body:

```json
{
  "repo_id": "Qwen/Qwen2.5-1.5B-Instruct-GGUF",
  "filename": "qwen2.5-1.5b-instruct-q3_k_m.gguf",
  "model_params": {
    "n_ctx": 2048,
    "n_gpu_layers": -1,
    "other_settings...": "other settings"
  },
  "prompt": "Explain quantum computing",
  "stream": true,
  "local": false
}
```

### GET `/api/status`

Health check endpoint.

### GET `/api/info`

Get API information.

## Technical Details

### llama-cpp-python with Metal

The backend uses `llama-cpp-python` which provides Python bindings to llama.cpp. On macOS, llama.cpp automatically uses Metal (Apple's GPU framework) for acceleration, significantly improving inference speed compared to CPU-only execution.

Key parameters:

- `n_gpu_layers=-1`: Offload all layers to GPU (Metal)
- `n_ctx`: Context window size (affects memory usage)
- GGUF format: Quantized model format that reduces memory requirements

### Performance Considerations

- **Quantization levels**: Q3_K_M uses less memory but may reduce quality; Q5_K_M offers better quality but uses more memory
- **Context size**: Larger contexts require more memory and may slow down inference
- **GPU layers**: Setting to -1 offloads all layers to Metal for maximum performance
- **Model size**: Smaller models (1.5B-3B params) run faster; larger models provide better quality but require more resources

## Development

### Backend Development

```bash
cd llm-inference-server-backend
uv run dev  # Auto-reloads on code changes
```

### Frontend Development

```bash
cd llm-inference-server-frontend
npm run dev  # Auto-reloads on code changes
```

### Building for Production

Backend:

```bash
cd llm-inference-server-backend
uv build
```

Frontend:

```bash
cd llm-inference-server-frontend
npm run build
npm start
```

## Dependencies

### Backend

- FastAPI: Web framework
- llama-cpp-python: Python bindings for llama.cpp with Metal support
- uvicorn: ASGI server
- huggingface-hub: Model downloading from HuggingFace
- psutil: System and process utilities for memory tracking

### Frontend

- Next.js 16: React framework
- React 19: UI library
- Tailwind CSS: Styling
- TypeScript: Type safety
