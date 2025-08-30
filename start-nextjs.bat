@echo off
echo Starting DP's VL Tool Next.js App...
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM 检查npm是否安装
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please reinstall Node.js
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.
echo npm version:
npm --version
echo.

REM 安装依赖
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    echo.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo Starting development server...
echo.
echo Your app will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

REM 启动开发服务器
npm run dev

pause
