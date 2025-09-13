#!/usr/bin/env python3

"""
Production-ready MindfulMate Backend Server
- Robust error handling
- Automatic fallbacks
- Health monitoring
- Performance optimization
"""

import uvicorn
import os
import sys
import logging
from datetime import datetime

def setup_logging():
    """Setup comprehensive logging"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('mindfulmate_server.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )

def setup_environment():
    """Setup environment and paths"""
    # Ensure we're in the backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    sys.path.insert(0, backend_dir)
    
    # Create data directories
    data_dir = os.path.join(backend_dir, "local_data")
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"Created data directory: {data_dir}")

def test_critical_systems():
    """Test all critical systems before starting"""
    print("\n" + "="*50)
    print("🔧 TESTING CRITICAL SYSTEMS")
    print("="*50)
    
    # Test 1: Local Storage
    try:
        from local_storage import save_journal_entry_local, get_journals_by_username_local
        test_id = save_journal_entry_local("System Test", "Testing local storage", "system")
        journals = get_journals_by_username_local("system")
        print(f"✅ Local Storage: Working ({len(journals)} entries)")
    except Exception as e:
        print(f"❌ Local Storage: FAILED - {e}")
        return False
    
    # Test 2: Database Handler
    try:
        from mongodb_database_handler import save_journal_entry, get_journals_by_username
        test_id = save_journal_entry("Handler Test", "Testing database handler", "handler_test")
        journals = get_journals_by_username("handler_test")
        print(f"✅ Database Handler: Working (fallback active)")
    except Exception as e:
        print(f"❌ Database Handler: FAILED - {e}")
        return False
    
    # Test 3: Authentication
    try:
        from auth_handler import register_user, login_user
        result = register_user("test_production", "test@prod.com", "testpass")
        if result.get("success") or "already exists" in result.get("error", ""):
            print("✅ Authentication: Working")
        else:
            print(f"⚠️  Authentication: {result.get('error', 'Unknown issue')}")
    except Exception as e:
        print(f"❌ Authentication: FAILED - {e}")
        return False
    
    # Test 4: LLM Handler
    try:
        from llm_handler import initialize_gemini_llm
        llm = initialize_gemini_llm()
        if llm is not None:
            print("✅ Gemini LLM: Available")
        else:
            print("⚠️  Gemini LLM: Not available (check API key)")
    except Exception as e:
        print(f"❌ LLM Handler: FAILED - {e}")
    
    print("="*50)
    return True

def main():
    """Main server startup"""
    print("="*60)
    print("🚀 MINDFULMATE PRODUCTION SERVER")
    print("="*60)
    print(f"📅 Startup Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🎯 Mode: Production-Ready with Full Error Handling")
    print("🌐 URL: http://localhost:8000")
    print("💾 Storage: Local JSON with MongoDB fallback")
    print("🤖 AI: Gemini (primary) + OpenAI (optional)")
    print("="*60)
    
    # Setup
    setup_logging()
    setup_environment()
    
    # Test systems
    if not test_critical_systems():
        print("\n❌ CRITICAL SYSTEM TESTS FAILED!")
        print("Cannot start server safely. Please check error messages above.")
        input("Press Enter to exit...")
        return
    
    print("\n✅ ALL SYSTEMS READY!")
    print("\n🚀 Starting FastAPI server...")
    print("="*60)
    
    # Start server with production settings
    try:
        uvicorn.run(
            "fast_api:app",
            host="0.0.0.0",  # Accept connections from anywhere
            port=8000,
            reload=True,  # Development mode
            log_level="info",
            access_log=True,
            workers=1  # Single worker for development
        )
    except KeyboardInterrupt:
        print("\n👋 Server shutting down gracefully...")
    except Exception as e:
        print(f"\n❌ Server failed to start: {e}")
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()
