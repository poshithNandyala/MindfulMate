@echo off
echo Killing any existing servers...
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting clean MindfulMate server...
cd /d "%~dp0\backend"
python minimal_server.py
