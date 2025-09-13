"""
Authentication handler for MindfulMate
Handles user registration, login, and session management
"""

import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from local_storage import (
    save_to_file, load_from_file, ensure_data_dir,
    users_storage, sessions_storage
)
import os
import json

# File paths for auth data
DATA_DIR = "local_data"
USERS_FILE = os.path.join(DATA_DIR, "users.json")
SESSIONS_FILE = os.path.join(DATA_DIR, "sessions.json")

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_session_token() -> str:
    """Generate a secure session token"""
    return secrets.token_urlsafe(32)

def load_auth_data():
    """Load authentication data from files"""
    global users_storage, sessions_storage
    
    ensure_data_dir()
    
    # Load users
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                users_storage = json.load(f)
        except Exception as e:
            print(f"Error loading users: {e}")
            users_storage = {}
    else:
        users_storage = {}
    
    # Load sessions
    if os.path.exists(SESSIONS_FILE):
        try:
            with open(SESSIONS_FILE, 'r', encoding='utf-8') as f:
                sessions_storage = json.load(f)
        except Exception as e:
            print(f"Error loading sessions: {e}")
            sessions_storage = {}
    else:
        sessions_storage = {}

def save_auth_data():
    """Save authentication data to files"""
    ensure_data_dir()
    
    try:
        # Save users
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users_storage, f, indent=2, ensure_ascii=False)
        
        # Save sessions
        with open(SESSIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(sessions_storage, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving auth data: {e}")

# Load data on import
load_auth_data()

def register_user(username: str, email: str, password: str) -> Dict[str, Any]:
    """Register a new user"""
    # Check if username already exists
    if username in users_storage:
        return {"success": False, "error": "Username already exists"}
    
    # Check if email already exists
    for user_data in users_storage.values():
        if user_data.get("email") == email:
            return {"success": False, "error": "Email already exists"}
    
    # Create new user
    user_data = {
        "username": username,
        "email": email,
        "password_hash": hash_password(password),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None
    }
    
    users_storage[username] = user_data
    save_auth_data()
    
    return {"success": True, "message": "User registered successfully"}

def login_user(username: str, password: str) -> Dict[str, Any]:
    """Login user and create session"""
    # Check if user exists
    if username not in users_storage:
        return {"success": False, "error": "Invalid username or password"}
    
    user_data = users_storage[username]
    
    # Check password
    if user_data["password_hash"] != hash_password(password):
        return {"success": False, "error": "Invalid username or password"}
    
    # Create session
    session_token = generate_session_token()
    session_data = {
        "username": username,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
        "active": True
    }
    
    sessions_storage[session_token] = session_data
    
    # Update last login
    users_storage[username]["last_login"] = datetime.now(timezone.utc).isoformat()
    
    save_auth_data()
    
    return {
        "success": True, 
        "message": "Login successful",
        "session_token": session_token,
        "user": {
            "username": username,
            "email": user_data["email"]
        }
    }

def validate_session(session_token: str) -> Optional[Dict[str, Any]]:
    """Validate session token and return user data"""
    if session_token not in sessions_storage:
        return None
    
    session = sessions_storage[session_token]
    
    # Check if session is active
    if not session.get("active", False):
        return None
    
    # Check if session is expired
    expires_at = datetime.fromisoformat(session["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        # Mark session as inactive
        sessions_storage[session_token]["active"] = False
        save_auth_data()
        return None
    
    username = session["username"]
    if username in users_storage:
        user_data = users_storage[username]
        return {
            "username": username,
            "email": user_data["email"]
        }
    
    return None

def logout_user(session_token: str) -> Dict[str, Any]:
    """Logout user by invalidating session"""
    if session_token in sessions_storage:
        sessions_storage[session_token]["active"] = False
        save_auth_data()
        return {"success": True, "message": "Logout successful"}
    
    return {"success": False, "error": "Invalid session"}

def get_user_info(username: str) -> Optional[Dict[str, Any]]:
    """Get user information"""
    if username in users_storage:
        user_data = users_storage[username]
        return {
            "username": username,
            "email": user_data["email"],
            "created_at": user_data["created_at"],
            "last_login": user_data["last_login"]
        }
    return None
