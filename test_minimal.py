"""
Test the minimal server
"""
import requests
import json
import time

def test_minimal_chat():
    url = "http://localhost:8000/chat/"
    
    # Test message
    test_message = "Hello, how are you today?"
    
    try:
        response = requests.post(url, json={"prompt": test_message}, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print("SUCCESS: Chat working!")
            print("Response:", data.get("response", "No response")[:100] + "...")
            return True
        else:
            print(f"FAILED: HTTP {response.status_code}")
            print("Error:", response.text)
            return False
            
    except requests.exceptions.ConnectionError:
        print("FAILED: Cannot connect to server")
        print("Make sure to run: python minimal_server.py")
        return False
    except Exception as e:
        print(f"FAILED: {e}")
        return False

if __name__ == "__main__":
    print("Testing minimal MindfulMate server...")
    test_minimal_chat()
