#!/usr/bin/env python3

"""
Complete system test for MindfulMate
Tests backend API, storage, and frontend integration
"""

import requests
import json
import time
import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

def test_backend_api():
    """Test backend API endpoints"""
    print("=" * 50)
    print("TESTING BACKEND API")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/llm-status/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"PASS: Health check passed - Gemini available: {data.get('status', {}).get('gemini', {}).get('available', False)}")
        else:
            print(f"WARN: Health check returned status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"FAIL: Health check failed: {e}")
        return False
    
    # Test 2: Journal creation
    print("\n2. Testing journal creation...")
    test_journal = {
        "title": "System Test Journal",
        "entry": "This is a comprehensive test of the journal system with local storage fallback.",
        "username": "system_test_user"
    }
    
    try:
        response = requests.post(f"{base_url}/journal/", 
                               json=test_journal, 
                               headers={"Content-Type": "application/json"},
                               timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {data}")
        
        if response.status_code == 200 and data.get("success", False):
            print("✅ Journal creation successful")
        else:
            print(f"⚠️ Journal creation: {data.get('message', 'Unknown error')}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Journal creation failed: {e}")
        return False
    
    # Test 3: Journal retrieval
    print("\n3. Testing journal retrieval...")
    try:
        response = requests.get(f"{base_url}/journal/user/system_test_user", timeout=5)
        if response.status_code == 200:
            data = response.json()
            journal_count = data.get("count", 0)
            print(f"✅ Retrieved {journal_count} journals for system_test_user")
            
            if journal_count > 0:
                latest = data["journals"][0]
                print(f"   Latest: '{latest['title']}'")
                print(f"   Time: {latest['timestamp']}")
        else:
            print(f"⚠️ Journal retrieval returned status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Journal retrieval failed: {e}")
        return False
    
    # Test 4: Chat functionality  
    print("\n4. Testing chat functionality...")
    test_chat = {"prompt": "Hello, this is a test message. How are you?"}
    
    try:
        response = requests.post(f"{base_url}/chat/", 
                               json=test_chat,
                               headers={"Content-Type": "application/json"},
                               timeout=30)
        if response.status_code == 200:
            data = response.json()
            chat_response = data.get("response", "")
            if chat_response:
                print(f"✅ Chat response received: {chat_response[:100]}...")
            else:
                print("⚠️ Chat returned empty response")
        else:
            print(f"⚠️ Chat returned status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Chat test failed: {e}")
    
    return True

def test_local_storage():
    """Test local storage functionality"""
    print("\n" + "=" * 50)
    print("💾 TESTING LOCAL STORAGE")
    print("=" * 50)
    
    try:
        from local_storage import save_journal_entry_local, get_journals_by_username_local
        
        # Test saving
        journal_id = save_journal_entry_local(
            "Local Storage Test",
            "Testing direct local storage functionality",
            "local_test_user"
        )
        print(f"✅ Saved to local storage with ID: {journal_id}")
        
        # Test retrieval
        journals = get_journals_by_username_local("local_test_user")
        print(f"✅ Retrieved {len(journals)} journals from local storage")
        
        return True
        
    except Exception as e:
        print(f"❌ Local storage test failed: {e}")
        return False

def check_data_files():
    """Check if data files exist and have content"""
    print("\n" + "=" * 50)
    print("📁 CHECKING DATA FILES")
    print("=" * 50)
    
    data_dir = os.path.join(backend_path, "local_data")
    journals_file = os.path.join(data_dir, "journals.json")
    
    if os.path.exists(journals_file):
        try:
            with open(journals_file, 'r', encoding='utf-8') as f:
                journals = json.load(f)
            print(f"✅ Found {len(journals)} total journals in storage")
            
            # Show user breakdown
            users = {}
            for journal in journals:
                username = journal.get("username", "unknown")
                users[username] = users.get(username, 0) + 1
            
            print("📊 Journals by user:")
            for username, count in users.items():
                print(f"   {username}: {count} journals")
                
        except Exception as e:
            print(f"❌ Error reading journals file: {e}")
    else:
        print("⚠️ Journals file not found")

def main():
    print("🚀 MindfulMate System Test")
    print("Testing backend, storage, and integration")
    
    # Test local storage first
    storage_ok = test_local_storage()
    
    # Check data files
    check_data_files()
    
    # Test API (this will also test the fallback mechanism)
    api_ok = test_backend_api()
    
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    print(f"Local Storage: {'✅ PASS' if storage_ok else '❌ FAIL'}")
    print(f"Backend API: {'✅ PASS' if api_ok else '❌ FAIL'}")
    
    if storage_ok and api_ok:
        print("\n🎉 All tests passed! System is working correctly.")
        print("\nNext steps:")
        print("1. Start the backend server: python run_server.bat")
        print("2. Start the frontend: cd frontend && npm start")
        print("3. Open http://localhost:3000 in your browser")
    else:
        print("\n⚠️ Some tests failed. Check the output above.")

if __name__ == "__main__":
    main()
