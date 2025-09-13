"""
Utility script to clean up old conversations that don't have usernames
This prevents old anonymous chats from appearing in user-specific chat history
"""
import json
import os
from local_storage import load_from_file, save_to_file, conversations_storage

def cleanup_anonymous_conversations():
    """Remove conversations that don't have a username field"""
    print("Loading existing conversations...")
    load_from_file()
    
    original_count = len(conversations_storage)
    print(f"Found {original_count} total conversations")
    
    # Filter out conversations without usernames
    conversations_with_users = [
        conv for conv in conversations_storage 
        if conv.get("username") is not None and conv.get("username") != ""
    ]
    
    # Update the storage
    conversations_storage.clear()
    conversations_storage.extend(conversations_with_users)
    
    new_count = len(conversations_storage)
    removed_count = original_count - new_count
    
    print(f"Removed {removed_count} anonymous conversations")
    print(f"Kept {new_count} user-specific conversations")
    
    # Save the cleaned data
    save_to_file()
    print("SUCCESS: Cleanup completed and saved!")

if __name__ == "__main__":
    cleanup_anonymous_conversations()
