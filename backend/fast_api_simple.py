from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from llm_handler_simple import get_simple_response
import logging

# Initialize FastAPI
app = FastAPI(title="Mental Health Companion API", version="2.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Prompt(BaseModel):
    prompt: str

@app.get("/receive_hello/")
async def root():
    """Health check endpoint"""
    return {"message": "Hello World - Mental Health API v2.0"}

@app.post("/chat/")
async def chat(prompt: Prompt):
    """Chat with AI companion using Gemini + ChatGPT fallback"""
    if not prompt.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    try:
        print(f"Chat request: {prompt.prompt[:50]}...")
        
        # Get response from Gemini/OpenAI
        response = get_simple_response(prompt.prompt)
        
        if not response or not response.strip():
            raise HTTPException(status_code=500, detail="Empty response received")
        
        print(f"Response generated successfully")
        return {"response": response}
        
    except Exception as e:
        print(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")

@app.get("/conversations/")
async def get_conversations(date: str):
    """Get conversations for a date (simplified version)"""
    # For now, return empty - can be enhanced later
    return {"date": date, "conversations": []}

@app.post("/journal/")
async def create_journal(journal: dict):
    """Save journal entry (simplified)"""
    return {"message": "Journal entry saved", "journal_id": "simple_id"}

@app.get("/journal/")
async def get_journal_entries(date: str):
    """Get journal entries (simplified)"""
    return {"date": date, "journals": []}

if __name__ == "__main__":
    import uvicorn
    print("Starting Mental Health Companion Backend...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
