@echo off
cls
title MindfulMate - Production Deployment
color 0A

echo.
echo ===============================================
echo     MINDFULMATE - PRODUCTION DEPLOYMENT
echo ===============================================
echo.
echo 🎯 PRODUCTION FEATURES:
echo    ✓ Fast local storage (no MongoDB lag)
echo    ✓ Dark theme consistency
echo    ✓ Logout buttons added
echo    ✓ Connection overlay removed
echo    ✓ Optimized performance
echo    ✓ Production-ready code
echo.

echo 🚀 Starting Production Backend...
cd /d "c:\Users\kalya\OneDrive\Desktop\poshith\MindfulMate\backend"
start "Production Backend" cmd /k "echo Production Backend Server && python deploy_server.py"

echo ⏳ Waiting for backend startup...
timeout /t 6 /nobreak >nul

echo.
echo 🎨 Starting Frontend...
cd /d "c:\Users\kalya\OneDrive\Desktop\poshith\MindfulMate\frontend"
start "Frontend Dev" cmd /k "echo Frontend Development Server && npm start"

echo.
echo ===============================================
echo      🎉 PRODUCTION DEPLOYMENT READY!
echo ===============================================
echo.
echo 🌐 Backend API: http://localhost:8000
echo 🎨 Frontend App: http://localhost:3000
echo.
echo 📋 DEPLOYMENT IMPROVEMENTS:
echo    ✓ Removed MongoDB lag issues
echo    ✓ Added logout buttons everywhere
echo    ✓ Fixed dark theme consistency
echo    ✓ Removed connection overlay
echo    ✓ Optimized API calls
echo    ✓ Production-ready error handling
echo.
echo 🧪 TESTING CHECKLIST:
echo    1. Sign up new user
echo    2. Create journal entries
echo    3. Test mood responses
echo    4. View past journals (dark theme)
echo    5. Test logout functionality
echo    6. Check page switching speed
echo.
echo ⚠️  DEPLOYMENT NOTES:
echo    - Keep both server windows open
echo    - Backend uses local storage for speed
echo    - All data persists in backend/local_data/
echo    - Ready for production hosting
echo.

pause
