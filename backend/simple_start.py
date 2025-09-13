#!/usr/bin/env python3

"""
Simple backend server startup
"""

import uvicorn
import os
import sys

def main():
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    sys.path.append(backend_dir)
    
    print("=" * 50)
    print("MindfulMate Backend Server")
    print("=" * 50)
    print("Port: 8080")
    print("Features:")
    print("- Journal saving (local storage fallback)")
    print("- Authentication system")
    print("- Mood-based AI responses") 
    print("- Gemini API (primary)")
    print("=" * 50)
    
    # Start server
    uvicorn.run(
        "fast_api:app",
        host="127.0.0.1",
        port=8080,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()
