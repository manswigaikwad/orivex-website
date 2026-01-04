# GitHub Repository Setup Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com and sign in
2. Click the "+" icon in the top right → "New repository"
3. Repository name: `code-masters-website` (or any name you prefer)
4. Description: "Code Masters - Professional Project Development Website"
5. Choose: **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these in your terminal:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/code-masters-website.git

# Rename branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

## Step 3: Alternative - Using GitHub CLI (if installed)

```bash
# Create repository and push in one command
gh repo create code-masters-website --public --source=. --remote=origin --push
```

## Step 4: Verify

1. Go to your GitHub repository page
2. You should see all your files
3. Make sure sensitive files (like service account JSON) are NOT visible

## Next: Deploy to Vercel

Once your code is on GitHub, follow the Vercel deployment steps in DEPLOYMENT.md

