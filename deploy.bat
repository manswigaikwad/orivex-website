@echo off
echo ========================================
echo Code Masters Website - Vercel Deployment
echo ========================================
echo.
echo Step 1: Login to Vercel (if not already logged in)
vercel login
echo.
echo Step 2: Deploying to Vercel...
vercel
echo.
echo Step 3: For production deployment, run: vercel --prod
echo.
pause

