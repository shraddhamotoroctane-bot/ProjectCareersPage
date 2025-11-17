# 🚀 Deployment Guide - MotorOctane Careers Page

Complete step-by-step guide to deploy this project to GitHub and Vercel.

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub account
- Vercel account (free tier works)
- Google Sheets API credentials (already configured)

---

## 🔧 Step 1: Initialize Git Repository

### 1.1 Check if Git is already initialized

```bash
git status
```

If you see "not a git repository", proceed to initialize:

### 1.2 Initialize Git (if not already done)

```bash
git init
```

### 1.3 Add all files to Git

```bash
git add .
```

### 1.4 Create initial commit

```bash
git commit -m "Initial commit: MotorOctane Careers Page"
```

---

## 📤 Step 2: Create GitHub Repository

### 2.1 Create Repository on GitHub

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `ProjectCareersPage`
4. Description: `MotorOctane Careers Page - Full-stack application`
5. Choose **Private** or **Public** (your choice)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

### 2.2 Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ProjectCareersPage.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** If you get authentication errors, you may need to:
- Use a Personal Access Token instead of password
- Or set up SSH keys

---

## 🌐 Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

### 3.2 Deploy via Vercel Dashboard (Recommended for First Time)

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `ProjectCareersPage` repository
4. Configure the project:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/public`
   - **Install Command:** `npm install`

### 3.3 Set Environment Variables in Vercel

**CRITICAL:** You must add these environment variables in Vercel:

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add the following variables:

```
GOOGLE_SHEET_ID=1_xXLokhPbeqs8NdMxpV4WZJvdztZ6Wu-Q5m4S_Jbjlg
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
NODE_ENV=production
PORT=3000
```

**Important Notes:**
- Replace `your-service-account-email@project.iam.gserviceaccount.com` with your actual service account email
- For `GOOGLE_PRIVATE_KEY`, copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the quotes around the private key value
- The private key should have `\n` for newlines (Vercel will handle this)

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be live at: `https://your-project-name.vercel.app`

---

## 🔍 Step 4: Verify Deployment

### 4.1 Test Your Live Site

1. Visit your Vercel URL
2. Check if the careers page loads
3. Test job listings
4. Test application form submission

### 4.2 Check Google Sheets Connection

1. Open your Google Sheet: `https://docs.google.com/spreadsheets/d/1_xXLokhPbeqs8NdMxpV4WZJvdztZ6Wu-Q5m4S_Jbjlg/edit`
2. Make sure the service account email has **Editor** access
3. Submit a test application through your live site
4. Check if it appears in the Google Sheet

---

## 🛠️ Troubleshooting

### Build Fails on Vercel

**Error:** "Could not find the build directory"

**Solution:**
- Check that `npm run build` completes successfully locally
- Verify `dist/public` folder is created after build
- Check Vercel build logs for specific errors

### Google Sheets Not Working

**Error:** "Missing Google Sheets credentials"

**Solution:**
1. Double-check environment variables in Vercel
2. Ensure private key includes newlines (`\n`)
3. Verify service account has access to the Google Sheet
4. Check Vercel function logs for authentication errors

### Static Files Not Loading

**Error:** 404 for CSS/JS files

**Solution:**
- Verify `vercel.json` has correct `outputDirectory`
- Check that Vite build outputs to `dist/public`
- Review Vercel build logs

---

## 📝 Project Structure

```
ProjectCareersPage/
├── api/
│   └── index.ts          # Vercel serverless function handler
├── client/               # React frontend
│   ├── src/
│   └── index.html
├── server/              # Express backend
│   ├── index.ts
│   ├── routes.ts
│   └── ...
├── shared/              # Shared types
├── vercel.json          # Vercel configuration
├── package.json
└── vite.config.ts
```

---

## 🔄 Updating Your Deployment

After making changes:

```bash
# 1. Commit changes
git add .
git commit -m "Your commit message"

# 2. Push to GitHub
git push origin main

# 3. Vercel will automatically redeploy
```

---

## 📞 Support

If you encounter issues:
1. Check Vercel build logs
2. Check Vercel function logs
3. Verify environment variables
4. Test locally first: `npm run build && npm start`

---

## ✅ Deployment Checklist

- [ ] Git repository initialized
- [ ] Code committed to Git
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set in Vercel
- [ ] Build successful on Vercel
- [ ] Site accessible at Vercel URL
- [ ] Google Sheets connection working
- [ ] Test application submission works

---

**🎉 Congratulations! Your careers page is now live!**

