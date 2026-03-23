@echo off
echo ========================================
echo   InexTrack - Setup Script
echo ========================================
echo.

echo [1/4] Installing Server Dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Error installing server dependencies!
    pause
    exit /b %errorlevel%
)
echo Server dependencies installed successfully!
echo.

echo [2/4] Installing Client Dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo Error installing client dependencies!
    pause
    exit /b %errorlevel%
)
echo Client dependencies installed successfully!
echo.

echo [3/4] Setup Complete!
echo.

echo [4/4] Next Steps:
echo.
echo 1. Make sure MongoDB is running on your system
echo 2. Update the JWT_SECRET in server/.env file
echo 3. Open TWO terminal windows:
echo.
echo    Terminal 1 - Server:
echo    cd server
echo    npm run dev
echo.
echo    Terminal 2 - Client:
echo    cd client
echo    npm run dev
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo ========================================
echo   Setup Complete! Happy Tracking! 💰
echo ========================================
echo.
pause
