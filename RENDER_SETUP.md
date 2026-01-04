# Quick Setup Guide: Render.com

## Why Render?
- ✅ **Free tier available**
- ✅ **Very easy setup** (similar to Vercel)
- ✅ **Auto-deploy from GitHub**
- ✅ **Perfect for Express.js apps**
- ✅ **Automatic SSL**

## Step-by-Step Setup

### Step 1: Sign Up
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your **GitHub account** (recommended)

### Step 2: Create Web Service
1. After signing in, click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Find and select: **`manswigaikwad/code-masters-website`**
5. Click **"Connect"**

### Step 3: Configure Service
Fill in the form:

- **Name**: `code-masters-website`
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: (leave empty)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Plan**: Select **"Free"** (or paid if you prefer)

### Step 4: Add Environment Variables
Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"**

Add these one by one:

```
MONGODB_URI = your_mongodb_connection_string
MONGODB_DB = codemasters
MONGODB_COLLECTION = inquiries
GOOGLE_SHEETS_SPREADSHEET_ID = your_sheets_id
GOOGLE_SHEETS_SHEET_NAME = Sheet1
GOOGLE_SERVICE_ACCOUNT_JSON = your_full_json_string
ADMIN_TOKEN = your_secret_token
```

**Important**: 
- For `GOOGLE_SERVICE_ACCOUNT_JSON`, paste the entire JSON as a single string
- Make sure to select **"Apply to all environments"** for each variable

### Step 5: Deploy
1. Scroll to bottom
2. Click **"Create Web Service"**
3. Wait 2-3 minutes for deployment
4. Your site will be live at: `https://code-masters-website.onrender.com`

## Free Tier Notes:
- ⚠️ **Spins down after 15 minutes of inactivity**
- First request after spin-down takes ~30 seconds (cold start)
- 750 hours/month free (enough for most projects)
- Upgrade to paid ($7/month) for always-on service

## After Deployment:
1. Test your website at the provided URL
2. Test the contact form
3. Check MongoDB and Google Sheets integration
4. Test admin panel at `/admin.html`

## Custom Domain (Optional):
1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain
4. Follow DNS instructions

## That's it! Your website is live! 🎉

