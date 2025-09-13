@echo off
title MindfulMate Backend Server
cd /d "c:\Users\kalya\OneDrive\Desktop\poshith\MindfulMate\backend"
echo Starting MindfulMate Backend Server on port 8081...
echo.
echo Backend features:
echo - Authentication system
echo - Journal saving with local storage fallback
echo - Mood-based AI responses
echo - Gemini API (primary) + OpenAI fallback
echo.
python -m uvicorn fast_api:app --host 127.0.0.1 --port 8081 --reload
pause
