"""
Local in-memory storage as fallback for MongoDB
This provides basic functionality when MongoDB is not available
"""
from datetime import datetime, timezone
from typing import List, Dict, Optional
import json
import os

# In-memory storage
journals_storage: List[Dict] = []
conversations_storage: List[Dict] = []
summaries_storage: List[Dict] = []
users_storage: Dict[str, Dict] = {}
sessions_storage: Dict[str, Dict] = {}

# File paths for persistence
DATA_DIR = "local_data"
JOURNALS_FILE = os.path.join(DATA_DIR, "journals.json")
CONVERSATIONS_FILE = os.path.join(DATA_DIR, "conversations.json")
SUMMARIES_FILE = os.path.join(DATA_DIR, "summaries.json")

def ensure_data_dir():
    """Ensure data directory exists"""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

def load_from_file():
    """Load data from JSON files"""
    global journals_storage, conversations_storage, summaries_storage
    
    ensure_data_dir()
    
    # Load journals
    if os.path.exists(JOURNALS_FILE):
        try:
            with open(JOURNALS_FILE, 'r', encoding='utf-8') as f:
                journals_storage = json.load(f)
        except Exception as e:
            print(f"Error loading journals: {e}")
            journals_storage = []
    
    # Load conversations
    if os.path.exists(CONVERSATIONS_FILE):
        try:
            with open(CONVERSATIONS_FILE, 'r', encoding='utf-8') as f:
                conversations_storage = json.load(f)
        except Exception as e:
            print(f"Error loading conversations: {e}")
            conversations_storage = []
    
    # Load summaries
    if os.path.exists(SUMMARIES_FILE):
        try:
            with open(SUMMARIES_FILE, 'r', encoding='utf-8') as f:
                summaries_storage = json.load(f)
        except Exception as e:
            print(f"Error loading summaries: {e}")
            summaries_storage = []

def save_to_file():
    """Save data to JSON files"""
    ensure_data_dir()
    
    try:
        # Save journals
        with open(JOURNALS_FILE, 'w', encoding='utf-8') as f:
            json.dump(journals_storage, f, indent=2, ensure_ascii=False)
        
        # Save conversations
        with open(CONVERSATIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(conversations_storage, f, indent=2, ensure_ascii=False)
        
        # Save summaries
        with open(SUMMARIES_FILE, 'w', encoding='utf-8') as f:
            json.dump(summaries_storage, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving to files: {e}")

# Load data on import
load_from_file()

def save_journal_entry_local(title: str, entry: str, username: str) -> str:
    """Save journal entry to local storage"""
    journal_id = f"journal_{len(journals_storage) + 1}_{int(datetime.now().timestamp())}"
    
    journal_entry = {
        "_id": journal_id,
        "title": title,
        "entry": entry,
        "username": username,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    journals_storage.append(journal_entry)
    save_to_file()
    
    return journal_id

def get_journals_by_username_local(username: str) -> List[Dict]:
    """Get journals by username from local storage"""
    user_journals = [j for j in journals_storage if j.get("username") == username]
    # Sort by timestamp descending (newest first)
    user_journals.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return user_journals

def get_journals_by_date_local(date_str: str) -> List[Dict]:
    """Get journals by date from local storage"""
    date_journals = []
    
    for journal in journals_storage:
        journal_date = journal.get("timestamp", "").split("T")[0]  # Get date part
        if journal_date == date_str:
            date_journals.append(journal)
    
    # Sort by timestamp ascending
    date_journals.sort(key=lambda x: x.get("timestamp", ""))
    return date_journals

def upload_chat_in_conversation_local(user_prompt: str, sentiment_score: float, result: str, username: str = None):
    """Upload chat to local conversations storage"""
    chat_id = f"chat_{len(conversations_storage) + 1}_{int(datetime.now().timestamp())}"
    
    conversation = {
        "_id": chat_id,
        "user_input": user_prompt,
        "sentiment_score": sentiment_score,
        "response": result,
        "username": username,  # Add username to local storage
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    conversations_storage.append(conversation)
    save_to_file()

def get_past_conversations_local(limit: int = 10, username: str = None) -> List[Dict]:
    """Get past conversations from local storage, filtered by username"""
    # Always filter by username - if no username provided, return empty list
    # This prevents anonymous chats from mixing with user chats
    if username is None:
        return []
    
    # Only include conversations that belong to this specific user
    filtered_conversations = [
        conv for conv in conversations_storage 
        if conv.get("username") == username
    ]
    
    # Sort by timestamp descending and limit
    sorted_conversations = sorted(
        filtered_conversations, 
        key=lambda x: x.get("timestamp", ""), 
        reverse=True
    )
    
    formatted_conversations = []
    for conv in sorted_conversations[:limit]:
        formatted_conversations.append({
            "user_input": conv.get("user_input", ""),
            "response": conv.get("response", "")
        })
    
    return formatted_conversations

def get_chats_by_date_local(date_str: str, username: str = None) -> List[Dict]:
    """Get chats by date from local storage, filtered by username"""
    # Always filter by username - if no username provided, return empty list
    # This prevents anonymous chats from mixing with user chats
    if username is None:
        return []
        
    date_chats = []
    
    for chat in conversations_storage:
        chat_date = chat.get("timestamp", "").split("T")[0]  # Get date part
        if chat_date == date_str:
            # Only include chats that belong to this specific user
            if chat.get("username") == username:
                date_chats.append(chat)
    
    # Sort by timestamp ascending
    date_chats.sort(key=lambda x: x.get("timestamp", ""))
    return date_chats

def get_all_summaries_local() -> List[Dict]:
    """Get all summaries from local storage"""
    return sorted(summaries_storage, key=lambda x: x.get("date", ""), reverse=True)
