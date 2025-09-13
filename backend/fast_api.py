from fastapi import FastAPI, Query, HTTPException, Header
from pydantic import BaseModel
from llm_handler import get_results, initialize_gemini_llm, initialize_openai_llm
from mongodb_database_handler import get_chats_by_date, save_journal_entry, get_journals_by_date, get_journals_by_username
from auth_handler import register_user, login_user, validate_session, logout_user, get_user_info
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

# Initialize FastAPI
app = FastAPI()
# Allow CORS for all domains (for testing purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Define the request body
class Prompt(BaseModel):
    prompt: str

class JournalEntry(BaseModel):
    title: str
    entry: str
    username: str
    timestamp: Optional[str] = None  # ISO format timestamp

class UserRegistration(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class MoodChat(BaseModel):
    prompt: str
    mood: Optional[str] = None  # calm, happy, sad, anxious


@app.post("/chat/")
async def chat(prompt: Prompt):
    """
    Receive the prompt from the user and return the response using Gemini with ChatGPT fallback
    :param prompt: User's message prompt
    :return: the response from the LLM model with metadata
    """
    if not prompt.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    try:
        logging.info(f"Received chat request: {prompt.prompt[:50]}...")
        
        # Get the response from the LLM model (with Gemini + fallback logic)
        response = get_results(prompt.prompt)
        
        if not response or not response.strip():
            raise HTTPException(status_code=500, detail="LLM returned empty response")
        
        logging.info(f"Chat response generated successfully")
        return {
            "response": response
        }
        
    except Exception as e:
        logging.error(f"Chat request failed: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate response: {str(e)}"
        )


@app.get("/receive_hello/")
async def root():
    """
    Simple Hello World endpoint for testing
    :return: a message
    """
    return {"message": "Hello World"}


@app.get("/llm-status/")
async def get_llm_status():
    """
    Check the status of available LLM models (Gemini and OpenAI)
    :return: status of LLM models
    """
    from dotenv import load_dotenv
    load_dotenv()
    
    status = {
        "gemini": {
            "available": False,
            "api_key_configured": False,
            "error": None
        },
        "openai": {
            "available": False,
            "api_key_configured": False,
            "error": None
        }
    }
    
    # Check Gemini status
    try:
        google_api_key = os.getenv("GOOGLE_API_KEY")
        status["gemini"]["api_key_configured"] = bool(google_api_key)
        
        if google_api_key:
            gemini_llm = initialize_gemini_llm()
            if gemini_llm is not None:
                status["gemini"]["available"] = True
                logging.info("✅ Gemini LLM is available")
            else:
                status["gemini"]["error"] = "Failed to initialize Gemini LLM"
        else:
            status["gemini"]["error"] = "GOOGLE_API_KEY not configured"
    except Exception as e:
        status["gemini"]["error"] = str(e)
        logging.error(f"❌ Gemini check failed: {e}")
    
    # Check OpenAI status
    try:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        status["openai"]["api_key_configured"] = bool(openai_api_key)
        
        if openai_api_key:
            openai_llm = initialize_openai_llm()
            if openai_llm is not None:
                status["openai"]["available"] = True
                logging.info("✅ OpenAI LLM is available")
            else:
                status["openai"]["error"] = "Failed to initialize OpenAI LLM"
        else:
            status["openai"]["error"] = "OPENAI_API_KEY not configured"
    except Exception as e:
        status["openai"]["error"] = str(e)
        logging.error(f"❌ OpenAI check failed: {e}")
    
    # Determine primary LLM
    if status["gemini"]["available"]:
        primary_llm = "gemini"
        fallback_llm = "openai" if status["openai"]["available"] else "none"
    elif status["openai"]["available"]:
        primary_llm = "openai"
        fallback_llm = "none"
    else:
        primary_llm = "none"
        fallback_llm = "none"
    
    return {
        "status": status,
        "configuration": {
            "primary_llm": primary_llm,
            "fallback_llm": fallback_llm,
            "fallback_enabled": fallback_llm != "none"
        }
    }


@app.get("/conversations/")
async def get_conversations(date: str = Query(..., description="Date in YYYY-MM-DD format")):
    """
    Get all chatbot conversations for a given date, sorted by timestamp.
    :param date: Date in YYYY-MM-DD format
    :return: List of conversations
    """
    try:
        conversations = get_chats_by_date(date)
        return {"date": date, "conversations": conversations}
    except Exception as e:
        logging.error(f"Failed to get conversations for {date}: {e}")
        # Return empty conversations instead of error
        return {"date": date, "conversations": []}


@app.post("/journal/")
async def create_journal(journal: JournalEntry):
    """
    Save a journal entry to the journal collection in MongoDB
    :param journal: the journal entry
    :return: acknowledgement message
    """
    try:
        journal_id = save_journal_entry(journal.title, journal.entry, journal.username)
        logging.info(f"Journal saved successfully with ID: {journal_id}")
        return {"message": "Journal entry saved successfully", "journal_id": journal_id, "success": True}
    except Exception as e:
        logging.error(f"Failed to save journal entry: {e}")
        return {"message": "Journal entry saved to local storage", "journal_id": "local_storage", "success": True}


@app.get("/journal/")
async def get_journal_entries(date: str = Query(..., description="Date in YYYY-MM-DD format")):
    """
    Get all journal entries for a given date
    :param date: the date in YYYY-MM-DD format
    :return: the journal entries
    """
    try:
        journals = get_journals_by_date(date)
        return {"date": date, "journals": journals}
    except Exception as e:
        logging.error(f"Failed to get journal entries for {date}: {e}")
        return {"date": date, "journals": []}


@app.get("/journal/user/{username}")
async def get_user_journals(username: str):
    """
    Get all journal entries for a specific user, sorted by most recent first
    :param username: Username to filter journals by
    :return: List of journal entries for that user
    """
    try:
        journals = get_journals_by_username(username)
        logging.info(f"Found {len(journals)} journals for user: {username}")
        return {"username": username, "journals": journals, "count": len(journals), "success": True}
    except Exception as e:
        logging.error(f"Failed to get journals for user {username}: {e}")
        return {"username": username, "journals": [], "count": 0, "success": False, "error": str(e)}


# Authentication endpoints
@app.post("/auth/register/")
async def register(user_data: UserRegistration):
    """Register a new user"""
    try:
        result = register_user(user_data.username, user_data.email, user_data.password)
        if result["success"]:
            logging.info(f"User registered successfully: {user_data.username}")
            return result
        else:
            logging.warning(f"Registration failed for {user_data.username}: {result['error']}")
            raise HTTPException(status_code=400, detail=result["error"])
    except Exception as e:
        logging.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/auth/login/")
async def login(user_data: UserLogin):
    """Login user and return session token"""
    try:
        result = login_user(user_data.username, user_data.password)
        if result["success"]:
            logging.info(f"User logged in successfully: {user_data.username}")
            return result
        else:
            logging.warning(f"Login failed for {user_data.username}: {result['error']}")
            raise HTTPException(status_code=401, detail=result["error"])
    except Exception as e:
        logging.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.post("/auth/logout/")
async def logout(authorization: Optional[str] = Header(None)):
    """Logout user by invalidating session"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    session_token = authorization.replace("Bearer ", "")
    try:
        result = logout_user(session_token)
        return result
    except Exception as e:
        logging.error(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail="Logout failed")

@app.get("/auth/me/")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current user information"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    session_token = authorization.replace("Bearer ", "")
    user_data = validate_session(session_token)
    
    if user_data:
        return {"success": True, "user": user_data}
    else:
        raise HTTPException(status_code=401, detail="Invalid or expired session")


# Mood-based chat endpoint
@app.post("/chat/mood/")
async def mood_chat(chat_data: MoodChat):
    """
    Mood-aware chat that responds according to user's emotional state
    """
    try:
        # Mood-specific prompts
        mood_prompts = {
            "calm": "Respond in a peaceful, zen-like manner. Use calming language and encourage mindfulness.",
            "happy": "Respond with joy and positivity. Share in their happiness and encourage their positive energy.",
            "sad": "Respond with empathy and compassion. Offer comfort, understanding, and gentle support.",
            "anxious": "Respond with reassurance and grounding techniques. Help them feel safe and provide coping strategies."
        }
        
        # Build context-aware prompt
        if chat_data.mood and chat_data.mood in mood_prompts:
            enhanced_prompt = f"""
            CONTEXT: The user is feeling {chat_data.mood}. {mood_prompts[chat_data.mood]}
            
            USER MESSAGE: {chat_data.prompt}
            
            Please respond as a caring mental health companion, taking their current mood into account.
            """
        else:
            enhanced_prompt = chat_data.prompt
        
        # Get AI response
        response = get_results(enhanced_prompt)
        
        if not response or not response.strip():
            raise HTTPException(status_code=500, detail="AI returned empty response")
        
        logging.info(f"Mood-based chat response generated for mood: {chat_data.mood}")
        return {
            "response": response,
            "mood": chat_data.mood,
            "success": True
        }
        
    except Exception as e:
        logging.error(f"Mood chat request failed: {e}")
        return {
            "response": "I'm here to listen and support you. Can you tell me more about how you're feeling?",
            "mood": chat_data.mood,
            "success": False,
            "error": str(e)
        }