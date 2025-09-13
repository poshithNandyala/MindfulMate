"""
Direct Gemini API Handler
A fallback implementation that directly calls Google's Gemini API without LangChain dependencies
"""
import os
import json
import requests
from dotenv import load_dotenv
import logging
from typing import Optional

def get_direct_gemini_response(prompt: str, api_key: Optional[str] = None) -> str:
    """
    Make a direct API call to Google's Gemini API
    :param prompt: User's message
    :param api_key: Optional API key, will load from env if not provided
    :return: Response from Gemini
    """
    try:
        # Load environment variables if no API key provided
        if not api_key:
            load_dotenv()
            api_key = os.getenv("GOOGLE_API_KEY")
        
        if not api_key:
            logging.error("GOOGLE_API_KEY not found in environment variables")
            return "I'm here to listen and support you. How can I help you today?"
        
        # Use the latest Gemini model endpoint
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        
        # Create the system prompt for therapy context
        system_context = """You are a compassionate therapist and mental health companion. You are calm, gentle, understanding and empathetic. Your role is to listen, validate feelings, and provide emotional support. Don't give direct solutions - instead, help users explore their thoughts and feelings. Be patient and natural in conversation. Keep responses warm and supportive."""
        
        # Prepare the request payload
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"{system_context}\n\nUser: {prompt}\n\nResponse:"
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.8,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
                "stopSequences": []
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        # Make the API call with proper timeout
        logging.info("Making direct Gemini API call...")
        response = requests.post(url, json=payload, headers=headers, timeout=45)
        
        if response.status_code == 200:
            result = response.json()
            logging.info("Gemini API call successful")
            
            if "candidates" in result and len(result["candidates"]) > 0:
                candidate = result["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    parts = candidate["content"]["parts"]
                    if len(parts) > 0 and "text" in parts[0]:
                        response_text = parts[0]["text"].strip()
                        if response_text:
                            return response_text
            
            # If we reach here, try to extract any available text
            logging.warning(f"Unexpected Gemini response format: {result}")
            
        # Handle specific API errors
        elif response.status_code == 400:
            logging.error(f"Bad request to Gemini API: {response.text}")
        elif response.status_code == 429:
            logging.error("Gemini API rate limit exceeded")
        else:
            logging.error(f"Gemini API error {response.status_code}: {response.text}")
            
    except requests.exceptions.Timeout:
        logging.error("Gemini API request timed out")
    except requests.exceptions.ConnectionError:
        logging.error("Failed to connect to Gemini API")
    except requests.exceptions.RequestException as e:
        logging.error(f"Gemini API request error: {e}")
    except json.JSONDecodeError:
        logging.error("Failed to parse Gemini API response")
    except Exception as e:
        logging.error(f"Unexpected error in direct Gemini call: {e}")
    
    # Return a thoughtful fallback response
    return "I understand you're reaching out, and I'm here for you. Sometimes I have trouble connecting to my systems, but I want you to know that your feelings and thoughts matter. Can you tell me more about what's on your mind?"

def test_direct_gemini():
    """Test function to verify direct Gemini API works"""
    try:
        test_prompt = "Hello, I'm feeling a bit anxious today."
        response = get_direct_gemini_response(test_prompt)
        print("SUCCESS: Direct Gemini test successful!")
        print(f"Response: {response[:100]}...")
        return True
    except Exception as e:
        print(f"FAILED: Direct Gemini test failed: {e}")
        return False

if __name__ == "__main__":
    # Run test when script is executed directly
    test_direct_gemini()
