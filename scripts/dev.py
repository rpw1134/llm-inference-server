from uvicorn import run
from llm_inference_server.main import app

def main():
    print("Starting the FastAPI server in development mode...")
    run(app="llm_inference_server.main:app", port=8000, reload=True)
    
if __name__ == "__main__":
    main()