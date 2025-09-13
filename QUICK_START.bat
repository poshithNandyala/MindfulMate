@echo off
echo.
echo ======================================
echo    MINDFULMATE - QUICK START
echo ======================================
echo.

REM Start backend server
echo 1. Starting Backend Server...
cd /d "c:\Users\kalya\OneDrive\Desktop\poshith\MindfulMate\backend"
start "MindfulMate Backend" cmd /k "python simple_start.py"

echo    Backend starting on http://127.0.0.1:8080...
echo    Waiting for backend to be ready...

timeout /t 5 /nobreak >nul

REM Test backend
echo.
echo 2. Testing Backend Connection...
curl -s http://127.0.0.1:8080/llm-status/ >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Backend is ready!
) else (
    echo    ⚠️  Backend might still be starting...
)

echo.
echo 3. Starting Frontend...
cd /d "c:\Users\kalya\OneDrive\Desktop\poshith\MindfulMate\frontend"
start "MindfulMate Frontend" cmd /k "npm start"

echo.
echo ======================================
echo    🎉 MINDFULMATE IS STARTING UP!
echo ======================================
echo.
echo 🌐 Backend: http://127.0.0.1:8080
echo 🎨 Frontend: http://localhost:3000
echo.
echo 📝 FEATURES READY:
echo    ✅ User Authentication
echo    ✅ Journal Creation & Saving
echo    ✅ Past Journals (by date)
echo    ✅ Mood-Based AI Responses
echo    ✅ Local Storage Fallback
echo.
echo ⏰ Please wait 30-60 seconds for both servers to start
echo 🌐 Then open: http://localhost:3000
echo.
echo 🔧 If you have issues:
echo    1. Make sure no other apps use port 8080 or 3000
echo    2. Check both command windows for errors
echo    3. Restart this script if needed
echo.

pause
