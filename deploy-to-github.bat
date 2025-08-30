@echo off
echo ========================================
echo    DP's VL Tool - Deploy to GitHub
echo ========================================
echo.

REM 检查Git是否安装
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not in PATH
    echo Please run 'setup-git.bat' first
    pause
    exit /b 1
)

echo Git is available!
echo.

REM 获取GitHub仓库URL
set /p REPO_URL="Enter your GitHub repository URL (e.g., https://github.com/username/dp-vl-tool.git): "

if "%REPO_URL%"=="" (
    echo ERROR: Repository URL cannot be empty
    pause
    exit /b 1
)

echo.
echo Repository URL: %REPO_URL%
echo.

REM 添加远程仓库
echo Adding remote origin...
git remote add origin "%REPO_URL%"
if %errorlevel% neq 0 (
    echo ERROR: Failed to add remote origin
    echo This might mean the remote already exists
    echo.
    echo Removing existing remote and adding new one...
    git remote remove origin
    git remote add origin "%REPO_URL%"
    if %errorlevel% neq 0 (
        echo ERROR: Still failed to add remote
        pause
        exit /b 1
    )
)

echo Remote origin added successfully!
echo.

REM 重命名分支为main
echo Renaming branch to main...
git branch -M main
if %errorlevel% neq 0 (
    echo ERROR: Failed to rename branch
    pause
    exit /b 1
)

echo Branch renamed to main successfully!
echo.

REM 推送到GitHub
echo Pushing to GitHub...
echo This might take a few minutes...
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to push to GitHub
    echo.
    echo Possible reasons:
    echo 1. Repository doesn't exist on GitHub
    echo 2. Authentication failed
    echo 3. Network issues
    echo.
    echo Please check:
    echo - Repository exists on GitHub
    echo - You have write access
    echo - Your credentials are correct
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    SUCCESS! Deployed to GitHub!
echo ========================================
echo.
echo Your code is now on GitHub at:
echo %REPO_URL%
echo.
echo Next step: Deploy to Vercel
echo 1. Go to https://vercel.com
echo 2. Sign in with GitHub
echo 3. Click "New Project"
echo 4. Import your GitHub repository
echo 5. Get your public URL!
echo.
echo Your app will be available at a public URL like:
echo https://dp-vl-tool-abc123.vercel.app
echo.
pause
