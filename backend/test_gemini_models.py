#!/usr/bin/env python3
"""
Test script to check which Gemini models are available and working
"""

import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_gemini_models():
    """Test different Gemini model names to see which ones work"""
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Load Google API key
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if not google_api_key:
        print("❌ GOOGLE_API_KEY not found in .env file")
        return False
        
    print(f"API Key found: {google_api_key[:10]}...")
    
    # Try different model names
    models_to_test = [
        "gemini-1.5-flash",
        "gemini-1.5-pro", 
        "gemini-2.0-flash-exp",
        "gemini-pro",  # Legacy name (should fail)
        "models/gemini-1.5-flash",
        "models/gemini-1.5-pro"
    ]
    
    print("\nTesting Gemini Models:")
    print("=" * 50)
    
    for model_name in models_to_test:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            
            print(f"\nTesting model: {model_name}")
            
            # Initialize with minimal settings
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=google_api_key,
                temperature=0.7,
                convert_system_message_to_human=True,
                max_retries=1,
                request_timeout=10
            )
            
            # Test with a simple prompt
            test_prompt = "Hello, please respond with just 'Hi there!'"
            response = llm.invoke(test_prompt)
            
            print(f"  SUCCESS: {model_name}")
            print(f"  Response: {response.content[:100]}...")
            
            return model_name  # Return the first working model
            
        except Exception as e:
            error_msg = str(e)
            print(f"  FAILED: {model_name}")
            print(f"  Error: {error_msg[:100]}...")
            
    print("\nNo working Gemini models found!")
    return None

if __name__ == "__main__":
    working_model = test_gemini_models()
    
    if working_model:
        print(f"\nSUCCESS! Working model found: {working_model}")
        print(f"\nUpdate your code to use: {working_model}")
    else:
        print("\nNo working models found. Please check:")
        print("  1. Your GOOGLE_API_KEY is valid")
        print("  2. You have access to Gemini models")
        print("  3. Your internet connection")
