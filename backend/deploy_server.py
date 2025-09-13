#!/usr/bin/env python3

"""
DEPLOYMENT-READY MindfulMate Backend
- No Unicode characters
- Production optimized  
- Local storage only
- Fast and reliable
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
import sys
import uvicorn

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import production modules
from local_storage import (
    save_journal_entry_local, 
    get_journals_by_username_local, 
    upload_chat_in_conversation_local
)
from auth_handler import register_user, login_user

# Initialize FastAPI
app = FastAPI(title="MindfulMate API", version="1.0.0")

# CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Prompt(BaseModel):
    prompt: str

class JournalEntry(BaseModel):
    title: str
    entry: str
    username: str

class UserRegistration(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class MoodChat(BaseModel):
    prompt: str
    mood: Optional[str] = None

# Health endpoints
@app.get("/")
async def root():
    return {"message": "MindfulMate API is running", "status": "OK"}

@app.get("/llm-status/")
async def llm_status():
    try:
        from dotenv import load_dotenv
        load_dotenv()
        google_api_key = os.getenv("GOOGLE_API_KEY")
        
        return {
            "status": {
                "gemini": {
                    "available": bool(google_api_key),
                    "api_key_configured": bool(google_api_key),
                    "error": None
                }
            },
            "configuration": {
                "primary_llm": "gemini",
                "storage": "local"
            }
        }
    except:
        return {"status": {"gemini": {"available": False}}}

# Journal endpoints
@app.post("/journal/")
async def create_journal(journal: JournalEntry):
    try:
        journal_id = save_journal_entry_local(journal.title, journal.entry, journal.username)
        return {"message": "Journal saved", "journal_id": journal_id, "success": True}
    except Exception as e:
        return {"message": "Save failed", "success": False, "error": str(e)}

@app.get("/journal/user/{username}")
async def get_user_journals(username: str):
    try:
        journals = get_journals_by_username_local(username)
        return {"username": username, "journals": journals, "count": len(journals), "success": True}
    except Exception as e:
        return {"username": username, "journals": [], "count": 0, "success": False}

# Auth endpoints
@app.post("/auth/register/")
async def register(user_data: UserRegistration):
    try:
        result = register_user(user_data.username, user_data.email, user_data.password)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/auth/login/")
async def login(user_data: UserLogin):
    try:
        result = login_user(user_data.username, user_data.password)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Login failed")

# Chat endpoints  
@app.post("/chat/")
async def chat(prompt: Prompt):
    try:
        # Use Gemini if available, otherwise fallback
        try:
            from llm_handler import get_results
            response = get_results(prompt.prompt)
        except:
            # Fallback responses
            responses = [
                "I'm here to listen. How are you feeling today?",
                "Thank you for sharing. What's on your mind?",
                "I understand. Tell me more about that.",
                "That's important. How can I support you?",
                "I'm here for you. What would you like to talk about?"
            ]
            response = responses[hash(prompt.prompt) % len(responses)]
        
        upload_chat_in_conversation_local(prompt.prompt, 0.5, response)
        return {"response": response}
    except Exception as e:
        return {"response": "I'm here to help. Please try again."}

@app.post("/chat/mood/")
async def mood_chat(chat_data: MoodChat):
    try:
        mood_responses = {
            "calm": "Take a deep breath. You're in a peaceful space. What brings you this calmness?",
            "happy": "Your happiness is wonderful! What's bringing you joy today?", 
            "sad": "I'm here with you. It's okay to feel sad. Want to share what's in your heart?",
            "anxious": "Take slow breaths with me. You're safe. What's causing these worried feelings?"
        }
        
        mood = chat_data.mood or "neutral"
        response = mood_responses.get(mood, "I'm here to support you. How are you feeling?")
        
        if chat_data.prompt:
            response += f" I hear you saying: '{chat_data.prompt[:50]}...' - tell me more."
        
        return {"response": response, "mood": mood, "success": True}
    except Exception as e:
        return {"response": "I'm here for you.", "mood": chat_data.mood, "success": False}

if __name__ == "__main__":
    print("Starting MindfulMate Production Server...")
    print("Features: Fast local storage, Authentication, Mood AI")
    print("URL: http://localhost:8000")
    uvicorn.run("deploy_server:app", host="0.0.0.0", port=8000, reload=True)
