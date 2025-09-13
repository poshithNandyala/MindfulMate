"""
Test script to verify user chat separation is working properly
"""
import requests
import json

API_BASE = "http://localhost:8081"

def test_user_separation():
    print("Testing user separation in chat history...")
    
    # Test data
    users = [
        {"username": "user1", "password": "pass1"},
        {"username": "user2", "password": "pass2"}
    ]
    
    messages = [
        "Hello, I'm user 1",
        "Hi there, I'm user 2",
        "This is my second message from user 1",
        "Another message from user 2"
    ]
    
    tokens = {}
    
    # Test each user
    for i, user in enumerate(users):
        print(f"\n--- Testing {user['username']} ---")
        
        # Login (assuming users exist)
        try:
            login_response = requests.post(f"{API_BASE}/auth/login/", json=user)
            if login_response.status_code == 200:
                data = login_response.json()
                token = data.get("session_token")
                tokens[user['username']] = token
                print(f"✓ {user['username']} logged in successfully")
            else:
                print(f"✗ Login failed for {user['username']}: {login_response.text}")
                continue
        except Exception as e:
            print(f"✗ Login error for {user['username']}: {e}")
            continue
        
        # Send test messages
        headers = {"Authorization": f"Bearer {token}"}
        for j in range(2):
            msg_index = i * 2 + j
            try:
                chat_response = requests.post(
                    f"{API_BASE}/chat/", 
                    json={"prompt": messages[msg_index]},
                    headers=headers
                )
                if chat_response.status_code == 200:
                    print(f"✓ Message sent: {messages[msg_index]}")
                else:
                    print(f"✗ Chat failed: {chat_response.text}")
            except Exception as e:
                print(f"✗ Chat error: {e}")
    
    # Test conversation retrieval
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")
    
    for username, token in tokens.items():
        print(f"\n--- Checking conversations for {username} ---")
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            conv_response = requests.get(
                f"{API_BASE}/conversations/?date={today}",
                headers=headers
            )
            if conv_response.status_code == 200:
                data = conv_response.json()
                conversations = data.get("conversations", [])
                print(f"✓ {username} has {len(conversations)} conversations")
                
                for conv in conversations:
                    user_input = conv.get("user_input", "")[:50]
                    print(f"  - {user_input}...")
            else:
                print(f"✗ Failed to get conversations: {conv_response.text}")
        except Exception as e:
            print(f"✗ Conversation retrieval error: {e}")

if __name__ == "__main__":
    test_user_separation()
