@echo off
REM Quick version bump and push to GitHub
REM Usage: release.bat [major|minor|patch] "Your change description"

SET VERSION_TYPE=%1
SET DESCRIPTION=%2

IF "%VERSION_TYPE%"=="" SET VERSION_TYPE=patch
IF "%DESCRIPTION%"=="" SET DESCRIPTION=Updates and improvements

echo.
echo 🚀 Starting release process...
echo.

REM Update version files
node scripts/update-version.js %VERSION_TYPE% "%DESCRIPTION%"

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Version update failed!
    exit /b 1
)

echo.
echo 📦 Staging changes...
git add .

echo.
echo 💾 Creating commit...
FOR /F "tokens=*" %%i IN ('node -p "require('./package.json').version"') DO SET NEW_VERSION=%%i
git commit -m "v%NEW_VERSION%: %DESCRIPTION%"

IF %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Nothing to commit or commit failed
    exit /b 1
)

echo.
echo 🌐 Pushing to GitHub...
git push origin main

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Push failed!
    exit /b 1
)

echo.
echo ✅ Release complete! Version: v%NEW_VERSION%
echo.
