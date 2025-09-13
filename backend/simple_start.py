"""
Simple startup script for MindfulMate backend without Weaviate dependencies
Uses direct Gemini API only
"""
import uvicorn
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

def start_server():
    """Start the FastAPI server directly"""
    print("Starting MindfulMate Backend Server...")
    print("Using Direct Gemini API")
    print("Server will be available at: http://localhost:8000")
    print("=" * 50)
    
    uvicorn.run("fast_api:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    start_server()
