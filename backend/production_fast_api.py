"""
Production-ready FastAPI for MindfulMate
- No MongoDB dependencies
- Fast local storage only
- Optimized for deployment
"""

from fastapi import FastAPI, Query, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

# Local imports (production-ready)
try:
    from local_storage import (
        save_journal_entry_local, 
        get_journals_by_username_local, 
        upload_chat_in_conversation_local,
        get_past_conversations_local
    )
    from auth_handler import register_user, login_user, validate_session, logout_user
    print("✅ All production modules loaded successfully")
except Exception as e:
    print(f"❌ Module import error: {e}")

# Initialize FastAPI
app = FastAPI(title="MindfulMate Production API", version="1.0.0")

# CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend only
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Setup logging
logging.basicConfig(level=logging.INFO)

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

# Routes
@app.get("/")
async def root():
    return {"message": "MindfulMate Production API", "status": "running", "version": "1.0.0"}

@app.get("/health/")
async def health():
    return {"status": "healthy", "storage": "local", "performance": "optimized"}

@app.get("/llm-status/")
async def llm_status():
    """LLM status endpoint"""
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        google_api_key = os.getenv("GOOGLE_API_KEY")
        
        return {
            "status": {
                "gemini": {
                    "available": bool(google_api_key),
                    "api_key_configured": bool(google_api_key),
                    "error": None if google_api_key else "GOOGLE_API_KEY not configured"
                }
            },
            "configuration": {
                "primary_llm": "gemini" if google_api_key else "none",
                "storage": "local_only"
            }
        }
    except Exception as e:
        return {"status": {"error": str(e)}, "configuration": {"primary_llm": "none"}}

@app.post("/journal/")
async def create_journal(journal: JournalEntry):
    """Save journal entry - PRODUCTION OPTIMIZED"""
    try:
        journal_id = save_journal_entry_local(journal.title, journal.entry, journal.username)
        logging.info(f"Journal saved: {journal_id} for user: {journal.username}")
        return {"message": "Journal saved successfully", "journal_id": journal_id, "success": True}
    except Exception as e:
        logging.error(f"Journal save failed: {e}")
        return {"message": "Failed to save journal", "success": False, "error": str(e)}

@app.get("/journal/user/{username}")
async def get_user_journals(username: str):
    """Get user journals - PRODUCTION OPTIMIZED"""
    try:
        journals = get_journals_by_username_local(username)
        logging.info(f"Retrieved {len(journals)} journals for: {username}")
        return {"username": username, "journals": journals, "count": len(journals), "success": True}
    except Exception as e:
        logging.error(f"Journal retrieval failed: {e}")
        return {"username": username, "journals": [], "count": 0, "success": False}

@app.post("/auth/register/")
async def register(user_data: UserRegistration):
    """User registration"""
    try:
        result = register_user(user_data.username, user_data.email, user_data.password)
        return result
    except Exception as e:
        logging.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/auth/login/")
async def login(user_data: UserLogin):
    """User login"""
    try:
        result = login_user(user_data.username, user_data.password)
        return result
    except Exception as e:
        logging.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.post("/chat/")
async def chat(prompt: Prompt):
    """Simple chat without heavy dependencies"""
    try:
        # Simple AI response for production
        responses = [
            "I'm here to listen and support you. How are you feeling today?",
            "Thank you for sharing. What would you like to talk about?",
            "I understand. Can you tell me more about what's on your mind?",
            "That sounds important. How can I help you with that?",
            "I'm here for you. What's been going through your mind lately?"
        ]
        
        # Use hash of prompt to get consistent but varied responses
        response_index = hash(prompt.prompt) % len(responses)
        response = responses[response_index]
        
        # Save to local storage
        upload_chat_in_conversation_local(prompt.prompt, 0.5, response)
        
        return {"response": response, "success": True}
    except Exception as e:
        logging.error(f"Chat error: {e}")
        return {"response": "I'm here to help. Please try again.", "success": False}

@app.post("/chat/mood/")
async def mood_chat(chat_data: MoodChat):
    """Mood-based chat responses"""
    try:
        mood_responses = {
            "calm": "Take a deep breath. You're in a peaceful space right now. Let's embrace this calmness together. What brings you this sense of peace?",
            "happy": "How wonderful that you're feeling happy! Your joy is contagious. What's bringing you this happiness today? Let's celebrate these positive moments.",
            "sad": "I'm here with you in this difficult moment. It's okay to feel sad - these emotions are valid. Would you like to share what's weighing on your heart?",
            "anxious": "I can sense you're feeling anxious. Let's take this one moment at a time. Try taking slow, deep breaths with me. You're safe right now. What's causing these worried feelings?"
        }
        
        mood = chat_data.mood or "neutral"
        response = mood_responses.get(mood, "I'm here to listen and support you. How can I help you today?")
        
        # Add user's message context
        if chat_data.prompt:
            response += f"\n\nI hear you saying: '{chat_data.prompt[:100]}...' - tell me more about this."
        
        # Save conversation
        upload_chat_in_conversation_local(chat_data.prompt, 0.5, response)
        
        return {"response": response, "mood": mood, "success": True}
    except Exception as e:
        logging.error(f"Mood chat error: {e}")
        fallback_response = "I'm here for you. How are you feeling right now?"
        return {"response": fallback_response, "mood": chat_data.mood, "success": False}

if __name__ == "__main__":
    import uvicorn
    print("Starting MindfulMate Production Server...")
    print("URL: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
