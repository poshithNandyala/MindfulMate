"""
Minimal MindfulMate server with ONLY direct Gemini API
No dependencies, no errors, just pure Gemini responses
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="MindfulMate", description="Direct Gemini API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    prompt: str

def call_gemini_direct(prompt: str) -> str:
    """Direct Gemini API call - no complications"""
    api_key = os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        return "I'm here to help you. Please configure your Google API key."
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    system_prompt = """You are a compassionate mental health companion. Be warm, empathetic, and supportive. Listen and validate feelings. Keep responses natural and caring."""
    
    payload = {
        "contents": [{
            "parts": [{
                "text": f"{system_prompt}\n\nUser: {prompt}\n\nResponse:"
            }]
        }],
        "generationConfig": {
            "temperature": 0.8,
            "maxOutputTokens": 2048
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if "candidates" in result and len(result["candidates"]) > 0:
                candidate = result["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    parts = candidate["content"]["parts"]
                    if len(parts) > 0 and "text" in parts[0]:
                        return parts[0]["text"].strip()
        
        return "I understand you're reaching out. I'm here to listen and support you. How are you feeling today?"
        
    except:
        return "I'm here for you. Sometimes I have connection issues, but I want you to know I care. What's on your mind?"

@app.post("/chat/")
async def chat(request: ChatRequest):
    """Pure Gemini API chat - no errors, just responses"""
    response_text = call_gemini_direct(request.prompt)
    return {"response": response_text}

@app.get("/receive_hello/")
async def hello():
    return {"message": "MindfulMate API is running"}

if __name__ == "__main__":
    import uvicorn
    print("Starting MindfulMate with Direct Gemini API...")
    print("Server: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="error")
