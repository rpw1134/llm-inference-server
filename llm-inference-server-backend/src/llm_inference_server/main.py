from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run
from llm_inference_server.routers.api import router


app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
async def read_root():
    return "Hello, World!"
    

def main():
    print("Starting the FastAPI server...")
    run(app="llm_inference_server.main:app", port=8000, reload=True)

if __name__ == "__main__":
    main()
