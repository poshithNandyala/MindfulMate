#!/usr/bin/env python3
"""
Simple test script to verify the backend setup is working correctly
"""
import os
from dotenv import load_dotenv
from llm_handler import initialize_llm_with_fallback, analyze_sentiment
from fast_api import app

def test_api_keys():
    """Test if API keys are properly configured"""
    load_dotenv()
    
    google_key = os.getenv("GOOGLE_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    print("API Key Status:")
    print(f"  GOOGLE_API_KEY: {'SET' if google_key else 'MISSING'}")
    print(f"  OPENAI_API_KEY: {'SET' if openai_key else 'MISSING'}")
    
    if not google_key and not openai_key:
        print("\nWARNING: No API keys found. Please check your .env file.")
        return False
    
    return True

def test_llm_initialization():
    """Test if LLM models can be initialized"""
    print("\nLLM Initialization Test:")
    
    try:
        primary_llm, fallback_llm, primary_type = initialize_llm_with_fallback()
        
        if primary_llm is None:
            print("  No LLMs available")
            return False
        
        print(f"  Primary LLM: {primary_type}")
        print(f"  Fallback available: {'Yes' if fallback_llm else 'No'}")
        return True
        
    except Exception as e:
        print(f"  Error: {e}")
        return False

def test_sentiment_analysis():
    """Test if sentiment analysis is working"""
    print("\nSentiment Analysis Test:")
    
    try:
        test_texts = [
            "I'm feeling great today!",
            "I'm really sad and upset.",
            "Today was okay, nothing special."
        ]
        
        for text in test_texts:
            score = analyze_sentiment(text)
            print(f"  '{text[:30]}...' -> Score: {score:.2f}")
        
        print("  Sentiment analysis working")
        return True
        
    except Exception as e:
        print(f"  Error: {e}")
        return False

def test_fastapi_app():
    """Test if FastAPI app can be created"""
    print("\nFastAPI App Test:")
    
    try:
        if app:
            print("  FastAPI app created successfully")
            print(f"  Available routes: {len(app.routes)} routes")
            return True
        else:
            print("  Failed to create FastAPI app")
            return False
            
    except Exception as e:
        print(f"  Error: {e}")
        return False

def main():
    """Run all tests"""
    print("MindfulMate Backend Setup Test\n")
    
    tests = [
        ("API Keys", test_api_keys),
        ("LLM Initialization", test_llm_initialization), 
        ("Sentiment Analysis", test_sentiment_analysis),
        ("FastAPI App", test_fastapi_app)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"  {test_name} crashed: {e}")
            results.append((test_name, False))
    
    print("\nTest Summary:")
    all_passed = True
    for test_name, passed in results:
        status = "PASS" if passed else "FAIL"
        print(f"  {test_name}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\nAll tests passed! Your backend is ready to go.")
        print("\nTo start the server, run:")
        print("   uvicorn fast_api:app --host 0.0.0.0 --port 8000 --reload")
    else:
        print("\nSome tests failed. Please check the errors above.")
        print("\nCommon solutions:")
        print("   - Ensure your .env file contains valid API keys")
        print("   - Run: pip install -r requirements.txt")
        print("   - Check your internet connection")

if __name__ == "__main__":
    main()
