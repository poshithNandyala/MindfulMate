#!/usr/bin/env python3

"""
Complete system test with server startup
"""

import os
import sys
import subprocess
import time
import requests
import threading

backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_dir)

def start_server():
    """Start the backend server in a separate process"""
    try:
        # Change to backend directory
        os.chdir(backend_dir)
        
        # Start server
        cmd = [sys.executable, 'working_server.py']
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=backend_dir
        )
        return process
    except Exception as e:
        print(f"Failed to start server: {e}")
        return None

def test_endpoints():
    """Test all endpoints"""
    print("\nTesting endpoints...")
    
    # Wait for server to be ready
    for i in range(15):
        try:
            response = requests.get("http://localhost:8000/", timeout=2)
            if response.status_code == 200:
                print(f"Server ready after {i+1} attempts")
                break
        except:
            print(f"Waiting for server... ({i+1}/15)")
            time.sleep(2)
    else:
        print("Server not responding after 30 seconds")
        return False
    
    # Test health
    try:
        response = requests.get("http://localhost:8000/llm-status/", timeout=5)
        print(f"Health check: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            gemini_available = data.get('status', {}).get('gemini', {}).get('available', False)
            print(f"Gemini available: {gemini_available}")
    except Exception as e:
        print(f"Health check failed: {e}")
    
    # Test chat
    try:
        print("\nTesting chat...")
        chat_response = requests.post(
            "http://localhost:8000/chat/",
            json={"prompt": "Hello, this is a test message!"},
            timeout=15
        )
        print(f"Chat status: {chat_response.status_code}")
        print(f"Chat response: {chat_response.text[:200]}...")
        
        if chat_response.status_code == 200:
            print("Chat is working!")
        
    except Exception as e:
        print(f"Chat test failed: {e}")
    
    # Test journal
    try:
        print("\nTesting journal...")
        journal_response = requests.post(
            "http://localhost:8000/journal/",
            json={
                "title": "System Test Journal",
                "entry": "Testing the complete system functionality",
                "username": "system_test"
            },
            timeout=10
        )
        print(f"Journal status: {journal_response.status_code}")
        print(f"Journal response: {journal_response.text}")
        
        if journal_response.status_code == 200:
            data = journal_response.json()
            if data.get("success"):
                print("Journal saving is working!")
                
                # Test retrieval
                get_response = requests.get(
                    "http://localhost:8000/journal/user/system_test",
                    timeout=5
                )
                if get_response.status_code == 200:
                    get_data = get_response.json()
                    print(f"Journal retrieval: {get_data.get('count', 0)} journals found")
        
    except Exception as e:
        print(f"Journal test failed: {e}")
    
    return True

def main():
    print("MindfulMate - Complete System Test")
    print("=" * 40)
    
    # Start server
    print("Starting backend server...")
    server_process = start_server()
    
    if server_process:
        try:
            # Test endpoints
            test_endpoints()
            
            print("\n" + "=" * 40)
            print("System test completed!")
            print("If chat and journal tests passed, the system is working.")
            print("\nTo use the app:")
            print("1. Keep the backend server running")
            print("2. Start frontend: cd frontend && npm start")
            print("3. Open: http://localhost:3000")
            
        finally:
            # Clean up
            print("\nStopping server...")
            server_process.terminate()
            try:
                server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server_process.kill()
    else:
        print("Failed to start server")

if __name__ == "__main__":
    main()
