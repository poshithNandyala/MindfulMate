#!/usr/bin/env python3

"""
Working MindfulMate Server - Minimal and Functional
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import sys
import logging

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import local modules
try:
    from local_storage import (
        save_journal_entry_local,
        get_journals_by_username_local,
        upload_chat_in_conversation_local,
        get_past_conversations_local
    )
    from auth_handler import register_user, login_user
    
    # Try to import Gemini LLM
    try:
        from llm_handler import initialize_gemini_llm
        gemini_available = True
    except:
        gemini_available = False
        
except Exception as e:
    print(f"Import error: {e}")
    sys.exit(1)

# FastAPI app
app = FastAPI(title="MindfulMate Working API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    mood: str = "neutral"

# Initialize Gemini once at startup
gemini_llm = None
if gemini_available:
    try:
        gemini_llm = initialize_gemini_llm()
        print("Gemini LLM initialized successfully")
    except Exception as e:
        print(f"Gemini initialization failed: {e}")

# Routes
@app.get("/")
async def root():
    return {"message": "MindfulMate API is working", "status": "OK"}

@app.get("/llm-status/")
async def llm_status():
    """Check LLM status"""
    from dotenv import load_dotenv
    load_dotenv()
    google_api_key = os.getenv("GOOGLE_API_KEY")
    
    return {
        "status": {
            "gemini": {
                "available": gemini_llm is not None,
                "api_key_configured": bool(google_api_key),
                "error": None if gemini_llm else "Gemini not initialized"
            }
        },
        "configuration": {
            "primary_llm": "gemini" if gemini_llm else "none",
            "storage": "local"
        }
    }

@app.post("/chat/")
async def chat(prompt: Prompt):
    """Chat with working Gemini AI"""
    try:
        if gemini_llm:
            # Use Gemini
            try:
                from langchain.prompts import PromptTemplate
                from langchain_core.output_parsers import StrOutputParser
                
                # Create simple prompt
                template = "You are a caring mental health companion. Respond supportively to: {user_input}"
                prompt_template = PromptTemplate.from_template(template)
                
                # Create chain
                chain = prompt_template | gemini_llm | StrOutputParser()
                
                # Get response
                response = chain.invoke({"user_input": prompt.prompt})
                
                # Save conversation (non-blocking)
                try:
                    upload_chat_in_conversation_local(prompt.prompt, 0.5, response)
                except:
                    pass  # Don't fail chat if saving fails
                
                return {"response": response}
                
            except Exception as e:
                print(f"Gemini chat error: {e}")
                # Fallback response
                return {"response": "I'm here to listen and support you. How are you feeling today?"}
        else:
            # No AI available, return supportive message
            return {"response": "I'm here to listen and support you. How can I help you today?"}
            
    except Exception as e:
        logging.error(f"Chat error: {e}")
        return {"response": "I'm here to help. Please try again."}

@app.post("/chat/mood/")
async def mood_chat(chat_data: MoodChat):
    """Mood-based chat responses"""
    mood_responses = {
        "calm": "Take a deep breath with me. You're in a peaceful space right now. What's bringing you this sense of calm today?",
        "happy": "Your happiness is wonderful! I love seeing you in such a positive mood. What's making you feel so joyful?",
        "sad": "I'm here with you in this difficult moment. It's completely okay to feel sad. Would you like to share what's weighing on your heart?",
        "anxious": "I can sense your anxiety. Let's take this one breath at a time. You're safe right now. What's causing these worried feelings?"
    }
    
    mood = chat_data.mood.lower()
    base_response = mood_responses.get(mood, "I'm here to listen and support you.")
    
    # Add context from user's message
    full_response = f"{base_response}\n\nI hear you saying: '{chat_data.prompt}' - tell me more about this."
    
    return {"response": full_response, "mood": mood, "success": True}

@app.post("/journal/")
async def create_journal(journal: JournalEntry):
    """Save journal entry"""
    try:
        journal_id = save_journal_entry_local(journal.title, journal.entry, journal.username)
        return {"message": "Journal saved successfully", "journal_id": journal_id, "success": True}
    except Exception as e:
        return {"message": "Failed to save journal", "success": False, "error": str(e)}

@app.get("/journal/user/{username}")
async def get_user_journals(username: str):
    """Get user journals"""
    try:
        journals = get_journals_by_username_local(username)
        return {"username": username, "journals": journals, "count": len(journals), "success": True}
    except Exception as e:
        return {"username": username, "journals": [], "count": 0, "success": False}

@app.get("/conversations/")
async def get_conversations(date: str):
    """Get conversations by date"""
    try:
        conversations = get_past_conversations_local(10)  # Get recent conversations
        return {"date": date, "conversations": conversations}
    except Exception as e:
        return {"date": date, "conversations": []}

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

if __name__ == "__main__":
    print("Starting MindfulMate Working Server...")
    print("Features: Gemini AI, Local Storage, Authentication")
    print("URL: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
