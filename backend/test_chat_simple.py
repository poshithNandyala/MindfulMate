#!/usr/bin/env python3
"""
Simple chat test without MongoDB to test Gemini directly
"""

import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from llm_handler import initialize_gemini_llm

def test_gemini_chat():
    """Test Gemini chat directly"""
    load_dotenv()
    
    print("Testing Gemini Chat...")
    
    try:
        # Initialize Gemini
        gemini = initialize_gemini_llm("gemini-1.5-flash")
        
        if gemini is None:
            print("Failed to initialize Gemini")
            return False
            
        # Simple test
        response = gemini.invoke("Hello, how are you? Please respond briefly.")
        print(f"Gemini Response: {response.content}")
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = test_gemini_chat()
    print(f"\nResult: {'SUCCESS' if success else 'FAILED'}")
