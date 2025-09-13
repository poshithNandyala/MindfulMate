"""
Quick test to verify direct Gemini API integration is working
"""
import requests
import json

def test_direct_chat():
    """Test the chat endpoint with direct Gemini API"""
    url = "http://localhost:8000/chat/"
    
    test_messages = [
        "Hello, how are you today?",
        "I'm feeling a bit anxious about work",
        "Can you help me relax?"
    ]
    
    print("Testing direct Gemini API chat...")
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n--- Test {i}: {message} ---")
        
        try:
            response = requests.post(url, json={"prompt": message}, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                chat_response = data.get("response", "No response")
                print(f"✓ SUCCESS: {chat_response[:100]}...")
            else:
                print(f"✗ HTTP Error {response.status_code}: {response.text}")
                
        except requests.exceptions.Timeout:
            print("✗ Request timed out")
        except Exception as e:
            print(f"✗ Error: {e}")

if __name__ == "__main__":
    test_direct_chat()
