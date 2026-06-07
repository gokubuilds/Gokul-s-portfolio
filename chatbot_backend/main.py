from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import get_rag_chain

app = FastAPI(title="Gokul's Portfolio Chatbot API")

# Configure CORS so the frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with the specific origin of your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    chain = get_rag_chain()
    if not chain:
        raise HTTPException(status_code=500, detail="RAG Pipeline is not initialized. Check your API keys and knowledge base.")
    
    try:
        response = chain.invoke({"query": request.query})
        answer = response.get("result", "I could not generate an answer.")
        return ChatResponse(response=answer)
    except Exception as e:
        print(f"Error during chat: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
