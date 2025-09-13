#!/usr/bin/env python3

import requests
import time
import json

def wait_for_server(max_attempts=10):
    """Wait for server to be ready"""
    for i in range(max_attempts):
        try:
            response = requests.get("http://localhost:8000/llm-status/", timeout=3)
            if response.status_code == 200:
                print(f"Server ready after {i+1} attempts")
                return True
        except:
            print(f"Attempt {i+1}: Server not ready, waiting...")
            time.sleep(2)
    return False

def test_chat():
    """Test chat functionality"""
    print("\nTesting chat functionality...")
    
    chat_data = {"prompt": "Hello! This is a test message. How are you?"}
    
    try:
        response = requests.post(
            "http://localhost:8000/chat/", 
            json=chat_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if "response" in data:
                print("SUCCESS: Chat is working!")
                print(f"AI Response: {data['response'][:100]}...")
                return True
            else:
                print("ERROR: No response in data")
        else:
            print(f"ERROR: Chat returned status {response.status_code}")
    
    except Exception as e:
        print(f"ERROR: Chat test failed: {e}")
    
    return False

def test_journal():
    """Test journal functionality"""
    print("\nTesting journal functionality...")
    
    journal_data = {
        "title": "Test Journal Entry",
        "entry": "This is a test journal entry to verify the system is working.",
        "username": "test_user_working"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/journal/",
            json=journal_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("SUCCESS: Journal saving is working!")
                return True
        
    except Exception as e:
        print(f"ERROR: Journal test failed: {e}")
    
    return False

def main():
    print("MindfulMate - Chat & Journal Test")
    print("=" * 40)
    
    if not wait_for_server():
        print("ERROR: Server not responding")
        return
    
    chat_ok = test_chat()
    journal_ok = test_journal()
    
    print("\n" + "=" * 40)
    print("TEST RESULTS:")
    print(f"Chat: {'WORKING' if chat_ok else 'FAILED'}")
    print(f"Journal: {'WORKING' if journal_ok else 'FAILED'}")
    
    if chat_ok and journal_ok:
        print("\nSUCCESS: Everything is working!")
        print("You can now use the frontend app.")
    else:
        print("\nERROR: Some functionality is broken.")
        print("Check the backend logs for details.")

if __name__ == "__main__":
    main()
