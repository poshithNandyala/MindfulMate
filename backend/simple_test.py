#!/usr/bin/env python3

"""
Simple test to verify local storage works
"""
import os
import sys

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("Testing local storage directly...")

try:
    from local_storage import save_journal_entry_local, get_journals_by_username_local
    print("Successfully imported local storage")
    
    # Test saving
    print("Testing save...")
    journal_id = save_journal_entry_local("Test Title", "Test Content", "test_user")
    print(f"Saved journal with ID: {journal_id}")
    
    # Test retrieval  
    print("Testing retrieval...")
    journals = get_journals_by_username_local("test_user")
    print(f"Found {len(journals)} journals")
    
    if journals:
        print(f"Latest: {journals[0]['title']} at {journals[0]['timestamp']}")
    
    print("Local storage test PASSED!")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
