from fastapi import FastAPI
from uvicorn import run


app = FastAPI()

@app.get("/")
async def read_root():
    return "Hello, World!"
    

def main():
    print("Starting the FastAPI server...")
    run(app="main:app", port=8000, reload=True)

if __name__ == "__main__":
    main()
