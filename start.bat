@echo off
echo Starting InexTrack Application...
echo.
echo Opening Server (Port 5000)...
start cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo Opening Client (Port 3000)...
start cmd /k "cd client && npm run dev"

echo.
echo Both server and client are starting...
echo Server: http://localhost:5000
echo Client: http://localhost:3000
echo.
echo Press any key to stop both servers...
pause >nul
