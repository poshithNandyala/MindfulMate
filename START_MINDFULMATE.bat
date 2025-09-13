@echo off
title MindfulMate - Complete System Startup
color 0A

echo.
echo ========================================
echo    🌟 MINDFULMATE SYSTEM STARTUP 🌟
echo ========================================
echo.
echo Starting your complete mental wellness app...
echo.

echo 1️⃣  Starting Backend Server...
echo    - Authentication system ✅
echo    - Mood-based AI responses ✅  
echo    - Local storage fallback ✅
echo    - Gemini LLM (primary) ✅
echo.

cd /d "c:\Users\kalya\OneDrive\Desktop\poshith\MindfulMate\backend"
start "MindfulMate Backend" cmd /k "echo Backend Server Starting... && python -m uvicorn fast_api:app --host 0.0.0.0 --port 8000 --reload"

echo    ⏳ Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo 2️⃣  Starting Frontend Development Server...
echo    - React with authentication ✅
echo    - Profile system ✅
echo    - Mood interactions ✅  
echo    - Past journals page ✅
echo.

cd /d "c:\Users\kalya\OneDrive\Desktop\poshith\MindfulMate\frontend"
start "MindfulMate Frontend" cmd /k "echo Frontend Server Starting... && npm start"

echo.
echo ========================================
echo     🎉 MINDFULMATE IS STARTING UP! 🎉  
echo ========================================
echo.
echo 🌐 Backend API: http://localhost:8000
echo 🎨 Frontend App: http://localhost:3000
echo.
echo 📋 WHAT'S WORKING:
echo    ✅ User Authentication (Sign Up/Sign In)
echo    ✅ Profile Management  
echo    ✅ Mood-Based AI Responses
echo    ✅ Journal Creation & Past Journals
echo    ✅ Chat with Gemini AI
echo    ✅ Local Storage Fallback
echo    ✅ Responsive Design
echo.
echo 🚀 GETTING STARTED:
echo    1. Wait for both servers to start (30-60 seconds)
echo    2. Open browser to http://localhost:3000
echo    3. Click "Sign Up" to create an account
echo    4. Click mood buttons for AI responses!
echo    5. Create journals and view past entries
echo.
echo ⚠️  NOTE: Keep both command windows open!
echo    Close this window when done testing.
echo.
echo ========================================
echo.

pause
