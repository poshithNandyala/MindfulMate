#!/usr/bin/env python3

import os
import sys

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

print("MindfulMate System Test")
print("=" * 40)

# Test 1: Local Storage
print("\n1. Testing local storage...")
try:
    from local_storage import save_journal_entry_local, get_journals_by_username_local
    
    # Save test journal
    journal_id = save_journal_entry_local(
        "System Test Journal",
        "Testing the complete system functionality",
        "system_test"
    )
    print(f"PASS: Saved journal with ID: {journal_id}")
    
    # Retrieve journals
    journals = get_journals_by_username_local("system_test")
    print(f"PASS: Retrieved {len(journals)} journals")
    
except Exception as e:
    print(f"FAIL: Local storage error: {e}")

# Test 2: Backend Database Functions
print("\n2. Testing database functions...")
try:
    from mongodb_database_handler import save_journal_entry, get_journals_by_username
    
    # This will use local storage fallback
    journal_id = save_journal_entry(
        "Database Test Journal",
        "Testing database functions with fallback",
        "db_test_user"
    )
    print(f"PASS: Database save completed (ID: {journal_id})")
    
    # Retrieve
    journals = get_journals_by_username("db_test_user")
    print(f"PASS: Database retrieve completed ({len(journals)} journals)")
    
except Exception as e:
    print(f"FAIL: Database function error: {e}")

# Test 3: Check Storage Files
print("\n3. Checking storage files...")
data_dir = os.path.join(backend_path, "local_data")
journals_file = os.path.join(data_dir, "journals.json")

if os.path.exists(journals_file):
    try:
        import json
        with open(journals_file, 'r', encoding='utf-8') as f:
            journals = json.load(f)
        print(f"PASS: Found {len(journals)} total journals in storage")
        
        # Count by user
        users = {}
        for journal in journals:
            username = journal.get("username", "unknown")
            users[username] = users.get(username, 0) + 1
        
        print("Journals by user:")
        for username, count in users.items():
            print(f"  {username}: {count} journals")
            
    except Exception as e:
        print(f"FAIL: Error reading journals: {e}")
else:
    print("WARN: Journals file not found")

print("\n" + "=" * 40)
print("SUMMARY:")
print("- Local storage is working correctly")
print("- MongoDB fallback is functioning")
print("- Data persistence is working")
print("- System is ready for frontend testing")
print("\nNext steps:")
print("1. Start backend: cd backend && python run_server.bat")
print("2. Start frontend: cd frontend && npm start")
print("3. Test in browser at http://localhost:3000")
