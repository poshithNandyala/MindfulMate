#!/usr/bin/env python3

import uvicorn
import os

if __name__ == "__main__":
    print("Starting MindfulMate Backend Server...")
    print("Server will run on http://localhost:8000")
    
    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Start the server
    uvicorn.run(
        "fast_api:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
