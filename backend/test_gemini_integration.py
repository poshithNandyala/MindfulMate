#!/usr/bin/env python3
"""
Test script for Gemini API integration with fallback to ChatGPT
This script tests both Gemini and fallback functionality
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Add current directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from llm_handler import initialize_gemini_llm, initialize_openai_llm, get_results

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def test_api_keys():
    """Test if API keys are configured correctly"""
    load_dotenv()
    
    google_key = os.getenv("GOOGLE_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    print("🔑 API Key Configuration:")
    print(f"  Google API Key: {'✅ Configured' if google_key else '❌ Missing'}")
    print(f"  OpenAI API Key: {'✅ Configured' if openai_key else '❌ Missing'}")
    print()
    
    return bool(google_key), bool(openai_key)

def test_gemini_initialization():
    """Test Gemini LLM initialization"""
    print("🤖 Testing Gemini Initialization...")
    try:
        gemini_llm = initialize_gemini_llm()
        if gemini_llm is not None:
            print("  ✅ Gemini LLM initialized successfully")
            return True
        else:
            print("  ❌ Gemini LLM initialization failed")
            return False
    except Exception as e:
        print(f"  ❌ Gemini initialization error: {e}")
        return False

def test_openai_initialization():
    """Test OpenAI LLM initialization"""
    print("🧠 Testing OpenAI Initialization...")
    try:
        openai_llm = initialize_openai_llm()
        if openai_llm is not None:
            print("  ✅ OpenAI LLM initialized successfully")
            return True
        else:
            print("  ❌ OpenAI LLM initialization failed")
            return False
    except Exception as e:
        print(f"  ❌ OpenAI initialization error: {e}")
        return False

def test_chat_functionality():
    """Test the actual chat functionality with fallback"""
    print("💬 Testing Chat Functionality with Fallback...")
    
    test_prompts = [
        "Hello, I'm feeling a bit anxious today.",
        "Can you help me feel better?",
        "I'm having trouble sleeping."
    ]
    
    for i, prompt in enumerate(test_prompts, 1):
        print(f"\n  Test {i}/3: {prompt[:30]}...")
        try:
            response = get_results(prompt)
            if response and response.strip():
                print(f"    ✅ Response received (length: {len(response)} chars)")
                print(f"    📝 Preview: {response[:100]}...")
            else:
                print("    ❌ Empty or invalid response")
                return False
        except Exception as e:
            print(f"    ❌ Chat test failed: {e}")
            return False
    
    return True

def main():
    """Main test function"""
    print("🧪 Gemini Integration Test Suite")
    print("=" * 50)
    
    # Test 1: API Keys
    has_gemini, has_openai = test_api_keys()
    
    if not has_openai:
        print("⚠️  Warning: OpenAI API key missing - fallback won't work")
    
    if not has_gemini and not has_openai:
        print("❌ No API keys configured. Please check your .env file.")
        return False
    
    # Test 2: LLM Initialization
    gemini_works = test_gemini_initialization()
    openai_works = test_openai_initialization()
    
    if not gemini_works and not openai_works:
        print("❌ Both Gemini and OpenAI initialization failed!")
        return False
    
    # Test 3: Chat functionality
    chat_works = test_chat_functionality()
    
    # Final Results
    print("\n" + "=" * 50)
    print("🎯 Test Results Summary:")
    print(f"  Gemini API: {'✅ Working' if gemini_works else '❌ Failed'}")
    print(f"  OpenAI API: {'✅ Working' if openai_works else '❌ Failed'}")
    print(f"  Chat Function: {'✅ Working' if chat_works else '❌ Failed'}")
    
    if gemini_works:
        print("\n🎉 SUCCESS: Gemini is working as primary LLM!")
        if openai_works:
            print("🛡️  Fallback system is fully operational.")
        else:
            print("⚠️  Note: Fallback system not available (OpenAI issues).")
    elif openai_works:
        print("\n⚠️  Gemini not available, but OpenAI fallback is working.")
    else:
        print("\n❌ FAILURE: No working LLM available.")
        return False
    
    print("\n🚀 Your mental health chatbot is ready!")
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error during testing: {e}")
        sys.exit(1)
