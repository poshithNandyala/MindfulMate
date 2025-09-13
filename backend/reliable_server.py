#!/usr/bin/env python3

"""
Reliable MindfulMate Backend Server
- No Unicode characters (Windows compatibility)
- Robust error handling
- Production ready
"""

import uvicorn
import os
import sys
import logging

def main():
    print("="*50)
    print("MINDFULMATE BACKEND SERVER")
    print("="*50)
    print("Port: 8000")
    print("Features: Authentication, Journals, Mood AI")
    print("Storage: Local JSON fallback")
    print("="*50)
    
    # Setup
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    sys.path.insert(0, backend_dir)
    
    # Create data directory
    data_dir = os.path.join(backend_dir, "local_data")
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"Created data directory: {data_dir}")
    
    # Test critical systems
    print("\nTesting systems...")
    try:
        from local_storage import save_journal_entry_local
        test_id = save_journal_entry_local("Server Start Test", "Testing system", "system")
        print("SUCCESS: Local storage working")
    except Exception as e:
        print(f"ERROR: Local storage failed - {e}")
        input("Press Enter to exit...")
        return
    
    try:
        from mongodb_database_handler import save_journal_entry
        test_id = save_journal_entry("Production Test", "Testing production server", "prod_test")
        print("SUCCESS: Database handler working (with fallback)")
    except Exception as e:
        print(f"ERROR: Database handler failed - {e}")
        input("Press Enter to exit...")
        return
    
    print("SUCCESS: All systems ready!")
    print("\nStarting FastAPI server...")
    print("OPEN: http://localhost:8000 in your browser")
    print("="*50)
    
    # Start server
    try:
        uvicorn.run(
            "fast_api:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"ERROR: Server failed - {e}")
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()
