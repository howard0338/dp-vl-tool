@echo off
echo ========================================
echo    DP's VL Tool - Git Setup Script
echo ========================================
echo.

REM 检查Git是否安装
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not in PATH
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo After installation, restart PowerShell and run this script again
    echo.
    pause
    exit /b 1
)

echo Git is installed successfully!
echo Git version:
git --version
echo.

REM 配置Git用户信息
echo Setting up Git configuration...
echo.
set /p GIT_USERNAME="Enter your GitHub username: "
set /p GIT_EMAIL="Enter your email address: "

git config --global user.name "%GIT_USERNAME%"
git config --global user.email "%GIT_EMAIL%"

echo.
echo Git configuration completed!
echo Username: %GIT_USERNAME%
echo Email: %GIT_EMAIL%
echo.

REM 初始化Git仓库
echo Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo ERROR: Failed to initialize Git repository
    pause
    exit /b 1
)

echo.
echo Adding files to Git...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)

echo.
echo Committing files...
git commit -m "Initial commit: DP's VL Tool - Next.js App"
if %errorlevel% neq 0 (
    echo ERROR: Failed to commit files
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Git Setup Completed Successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Go to https://github.com and create a new repository
echo 2. Copy the repository URL
echo 3. Run the following commands:
echo.
echo    git remote add origin YOUR_REPOSITORY_URL
echo    git branch -M main
echo    git push -u origin main
echo.
echo Or run the 'deploy-to-github.bat' script after creating the repository
echo.
pause
