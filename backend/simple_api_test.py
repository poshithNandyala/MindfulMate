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
    print(f"SUCCESS: Journal saved successfully with ID: {journal_id}")
except Exception as e:
    print(f"ERROR: Failed to save journal: {e}")

print("\n2. Testing journal retrieval...")
try:
    journals = get_journals_by_username("api_test_user")
    print(f"SUCCESS: Retrieved {len(journals)} journals")
    
    if journals:
        latest = journals[0]
        print(f"   Latest: '{latest['title']}'")
        print(f"   Content: {latest['entry'][:50]}...")
        print(f"   Time: {latest['timestamp']}")
        print(f"   User: {latest['username']}")
        
except Exception as e:
    print(f"ERROR: Failed to retrieve journals: {e}")

# Test multiple users
print("\n3. Testing multiple users...")
try:
    # Save for another user
    save_journal_entry("Another User Journal", "This is from another user", "user2")
    
    # Get journals for user 1
    user1_journals = get_journals_by_username("api_test_user")
    user2_journals = get_journals_by_username("user2")
    
    print(f"User 1 has {len(user1_journals)} journals")
    print(f"User 2 has {len(user2_journals)} journals")
    
    if len(user1_journals) > 0 and len(user2_journals) > 0:
        print("SUCCESS: Multi-user journal storage working!")
    
except Exception as e:
    print(f"ERROR: Multi-user test failed: {e}")

print("\nAPI functionality test completed!")
