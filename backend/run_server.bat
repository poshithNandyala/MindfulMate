@echo off
cd /d "c:\Users\kalya\OneDrive\Desktop\poshith\MindfulMate\backend"
echo Starting MindfulMate Backend Server...
echo Server will be available at http://localhost:8000
echo.
python -m uvicorn fast_api:app --host 0.0.0.0 --port 8000 --reload
pause
