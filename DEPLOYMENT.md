# Vercel Deployment Guide

## Prerequisites
1. A Vercel account (sign up at https://vercel.com)
2. GitHub account (recommended) or GitLab/Bitbucket
3. Your project pushed to a Git repository

## Step 1: Prepare Your Repository

1. Make sure your code is committed to Git:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

2. Push to GitHub/GitLab:
   ```bash
   git push origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the settings:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: npm install

5. **Important**: Add your Environment Variables:
   - Click "Environment Variables" section
   - Add the following variables:
     - `MONGODB_URI` - Your MongoDB connection string
     - `MONGODB_DB` - Your MongoDB database name (default: codemasters)
     - `MONGODB_COLLECTION` - Your MongoDB collection name (default: inquiries)
     - `GOOGLE_SHEETS_SPREADSHEET_ID` - Your Google Sheets ID
     - `GOOGLE_SHEETS_SHEET_NAME` - Your sheet name (default: Sheet1)
     - `GOOGLE_SERVICE_ACCOUNT_FILE` - Path to service account JSON file (if using file)
     - `GOOGLE_SERVICE_ACCOUNT_JSON` - Service account JSON as string (if using env var)
     - `ADMIN_TOKEN` - Your admin panel access token
     - `PORT` - (optional, Vercel sets this automatically)

6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and add environment variables when asked

5. For production deployment:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Environment Variables

After deployment, you can add/update environment variables:

1. Go to your project dashboard on Vercel
2. Navigate to Settings → Environment Variables
3. Add all required variables (see list above)
4. Redeploy after adding variables

## Step 4: Google Service Account Setup

If using Google Sheets integration, you have two options:

### Option 1: Environment Variable (Recommended)
- Add `GOOGLE_SERVICE_ACCOUNT_JSON` with the full JSON content as a string
- Make sure to escape quotes properly or use Vercel's UI

### Option 2: Service Account File
- Upload your service account JSON file to Vercel
- Set `GOOGLE_SERVICE_ACCOUNT_FILE` to the file path
- Note: This is less secure, prefer Option 1

## Step 5: Verify Deployment

1. Visit your deployed URL (provided by Vercel)
2. Test the contact form
3. Check that MongoDB and Google Sheets integration work
4. Test the admin panel at `/admin.html`

## Troubleshooting

### Common Issues:

1. **Build Fails**: 
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is compatible (Vercel uses Node 18.x by default)

2. **Environment Variables Not Working**:
   - Make sure variables are added in Vercel dashboard
   - Redeploy after adding variables
   - Check variable names match exactly (case-sensitive)

3. **MongoDB Connection Issues**:
   - Verify `MONGODB_URI` is correct
   - Check MongoDB Atlas allows connections from Vercel IPs (or use 0.0.0.0/0)

4. **Google Sheets Not Working**:
   - Verify service account JSON is correct
   - Check that service account has access to the spreadsheet
   - Ensure spreadsheet ID is correct

5. **Static Files Not Loading**:
   - Check that files are in the `public` folder
   - Verify routes in `vercel.json` are correct

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will provide SSL certificate automatically

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:
- Every push to `main` = Production deployment
- Pull requests = Preview deployments

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions

