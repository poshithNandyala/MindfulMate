#!/usr/bin/env python3

"""
Minimal test server to identify issues
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Create minimal FastAPI app
app = FastAPI(title="MindfulMate Test Server")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TestEntry(BaseModel):
    title: str
    entry: str
    username: str

@app.get("/")
async def root():
    return {"message": "MindfulMate Backend is running!", "status": "OK"}

@app.get("/health/")
async def health():
    return {"status": "healthy", "backend": "working"}

@app.post("/test-journal/")
async def test_journal(journal: TestEntry):
    """Test journal endpoint with minimal functionality"""
    try:
        # Import and test local storage
        from local_storage import save_journal_entry_local
        journal_id = save_journal_entry_local(journal.title, journal.entry, journal.username)
        return {"success": True, "journal_id": journal_id, "message": "Journal saved successfully"}
    except Exception as e:
        return {"success": False, "error": str(e), "message": "Failed to save journal"}

@app.get("/test-retrieve/{username}")
async def test_retrieve(username: str):
    """Test journal retrieval"""
    try:
        from local_storage import get_journals_by_username_local
        journals = get_journals_by_username_local(username)
        return {"success": True, "journals": journals, "count": len(journals)}
    except Exception as e:
        return {"success": False, "error": str(e), "journals": []}

if __name__ == "__main__":
    print("Starting minimal test server...")
    print("URL: http://localhost:8000")
    print("Test endpoints:")
    print("  GET  /")
    print("  GET  /health/")  
    print("  POST /test-journal/")
    print("  GET  /test-retrieve/{username}")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
