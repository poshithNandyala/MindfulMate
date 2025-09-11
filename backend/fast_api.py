from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel
from llm_handler import get_results, initialize_gemini_llm, initialize_openai_llm
from mongodb_database_handler import get_chats_by_date, save_journal_entry, get_journals_by_date
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
    timestamp: Optional[str] = None  # ISO format timestamp


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
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/journal/")
async def create_journal(journal: JournalEntry):
    """
    Save a journal entry to the journal collection in MongoDB
    :param journal: the journal entry
    :return: acknowledgement message
    """
    try:
        journal_id = save_journal_entry(journal.title, journal.entry)
        return {"message": "Journal entry saved successfully", "journal_id": journal_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
        raise HTTPException(status_code=500, detail=str(e))