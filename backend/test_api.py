#!/usr/bin/env python3

import os
import sys

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

print("Testing journal API functionality...")

# Test journal saving
from mongodb_database_handler import save_journal_entry, get_journals_by_username

print("\n1. Testing journal save...")
try:
    journal_id = save_journal_entry(
        title="API Test Journal",
        entry="This is a test to verify the journal API is working properly with local storage fallback.",
        username="api_test_user"
    )
    print(f"✅ Journal saved successfully with ID: {journal_id}")
except Exception as e:
    print(f"❌ Failed to save journal: {e}")

print("\n2. Testing journal retrieval...")
try:
    journals = get_journals_by_username("api_test_user")
    print(f"✅ Retrieved {len(journals)} journals")
    
    if journals:
        latest = journals[0]
        print(f"   Latest: '{latest['title']}'")
        print(f"   Content: {latest['entry'][:50]}...")
        print(f"   Time: {latest['timestamp']}")
        print(f"   User: {latest['username']}")
        
except Exception as e:
    print(f"❌ Failed to retrieve journals: {e}")

print("\n3. Testing chat functionality...")
try:
    from mongodb_database_handler import upload_chat_in_conversation, get_past_conversations
    
    # Test chat save
    upload_chat_in_conversation(
        user_prompt="Hello, how are you?",
        sentiment_score=0.5,
        result="I'm doing well, thank you for asking!"
    )
    print("✅ Chat conversation saved successfully")
    
    # Test chat retrieval
    past_chats = get_past_conversations(limit=5)
    print(f"✅ Retrieved {len(past_chats)} past conversations")
    
except Exception as e:
    print(f"❌ Failed to test chat: {e}")

print("\n🎉 API functionality test completed!")
