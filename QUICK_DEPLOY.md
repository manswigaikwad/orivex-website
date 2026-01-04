# Quick Deployment Guide - Code Masters Website

## Your code is ready! Follow these steps:

### Step 1: Login to Vercel

Open PowerShell/Command Prompt in your project folder and run:

```powershell
vercel login
```

This will:
- Open your browser
- Ask you to login/authorize
- Link your local machine to Vercel

### Step 2: Deploy to Vercel

After logging in, run:

```powershell
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (first time)
- **Project name?** → `code-masters-website` (or press Enter for default)
- **Directory?** → `./` (press Enter)
- **Override settings?** → No (press Enter)

### Step 3: Add Environment Variables

After first deployment, you need to add environment variables:

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to Settings → Environment Variables
4. Add these variables:

```
MONGODB_URI = your_mongodb_connection_string
MONGODB_DB = codemasters
MONGODB_COLLECTION = inquiries
GOOGLE_SHEETS_SPREADSHEET_ID = your_sheets_id
GOOGLE_SHEETS_SHEET_NAME = Sheet1
GOOGLE_SERVICE_ACCOUNT_JSON = your_full_json_string
ADMIN_TOKEN = your_secret_token
```

5. After adding, go to Deployments tab and click "Redeploy"

**Option B: Via CLI**
```powershell
vercel env add MONGODB_URI
vercel env add GOOGLE_SHEETS_SPREADSHEET_ID
vercel env add GOOGLE_SERVICE_ACCOUNT_JSON
vercel env add ADMIN_TOKEN
# ... add all variables
vercel --prod
```

### Step 4: Production Deployment

Once environment variables are set:

```powershell
vercel --prod
```

This deploys to production URL (your-project.vercel.app)

## Your Website Will Be Live At:
- Preview: `https://code-masters-website-xxxxx.vercel.app`
- Production: `https://code-masters-website.vercel.app`

## Troubleshooting

**If deployment fails:**
- Check that all dependencies are in package.json
- Verify Node.js version (Vercel uses Node 18.x)

**If environment variables don't work:**
- Make sure you added them in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

**Need help?**
- Vercel Docs: https://vercel.com/docs
- Check DEPLOYMENT.md for detailed instructions

