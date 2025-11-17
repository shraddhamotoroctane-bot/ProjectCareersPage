# ⚡ Quick Start - GitHub & Vercel Deployment

## 🎯 Your Google Sheet ID
**Sheet ID:** `1_xXLokhPbeqs8NdMxpV4WZJvdztZ6Wu-Q5m4S_Jbjlg`

---

## 📦 Step 1: Initialize Git & Push to GitHub

Run these commands in your terminal (PowerShell):

```powershell
# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: MotorOctane Careers Page"

# Add GitHub remote (REPLACE YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ProjectCareersPage.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**⚠️ Note:** If you get authentication errors:
- Use a Personal Access Token (Settings → Developer settings → Personal access tokens)
- Or use SSH: `git remote set-url origin git@github.com:YOUR_USERNAME/ProjectCareersPage.git`

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to:** https://vercel.com
2. **Sign in** with your GitHub account
3. **Click:** "Add New Project"
4. **Import** your `ProjectCareersPage` repository
5. **Configure:**
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`
6. **Click:** "Deploy" (we'll add environment variables next)

### Option B: Via Vercel CLI

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts
```

---

## 🔐 Step 3: Add Environment Variables in Vercel

**CRITICAL STEP!** Your app won't work without these.

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Add these **4 variables**:

### Variable 1: GOOGLE_SHEET_ID
```
Name: GOOGLE_SHEET_ID
Value: 1_xXLokhPbeqs8NdMxpV4WZJvdztZ6Wu-Q5m4S_Jbjlg
Environment: Production, Preview, Development
```

### Variable 2: GOOGLE_SERVICE_ACCOUNT_EMAIL
```
Name: GOOGLE_SERVICE_ACCOUNT_EMAIL
Value: [Your service account email from google-service-account.json]
Environment: Production, Preview, Development
```

**To find this:**
- Open `google-service-account.json` in your project
- Copy the `client_email` value
- It looks like: `something@project-name.iam.gserviceaccount.com`

### Variable 3: GOOGLE_PRIVATE_KEY
```
Name: GOOGLE_PRIVATE_KEY
Value: [Your entire private key from google-service-account.json]
Environment: Production, Preview, Development
```

**To find this:**
- Open `google-service-account.json`
- Copy the entire `private_key` value (including BEGIN/END lines)
- It should look like:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
...many lines...
-----END PRIVATE KEY-----
```

**⚠️ Important:** 
- Keep the quotes if they exist
- Include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- Vercel will handle newlines automatically

### Variable 4: NODE_ENV
```
Name: NODE_ENV
Value: production
Environment: Production, Preview, Development
```

### Variable 5: PORT (Optional)
```
Name: PORT
Value: 3000
Environment: Production, Preview, Development
```

4. **Click "Save"** for each variable
5. **Redeploy** your project (Vercel will automatically redeploy after adding env vars)

---

## ✅ Step 4: Verify Google Sheet Access

1. **Open your Google Sheet:**
   https://docs.google.com/spreadsheets/d/1_xXLokhPbeqs8NdMxpV4WZJvdztZ6Wu-Q5m4S_Jbjlg/edit

2. **Click "Share"** button (top right)
3. **Add your service account email** (the one from `GOOGLE_SERVICE_ACCOUNT_EMAIL`)
4. **Give it "Editor"** permissions
5. **Click "Send"**

---

## 🧪 Step 5: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://project-careers-page.vercel.app`)
2. Check if the page loads
3. Try submitting a test application
4. Check your Google Sheet to see if the application appears

---

## 🔄 Making Updates

After making code changes:

```powershell
# Commit changes
git add .
git commit -m "Your update message"

# Push to GitHub
git push origin main

# Vercel will automatically redeploy!
```

---

## 🐛 Troubleshooting

### Build Fails
- Check Vercel build logs
- Test locally: `npm run build`
- Ensure all dependencies are in `package.json`

### Google Sheets Not Working
- Verify environment variables are set correctly
- Check service account has Editor access to the sheet
- Review Vercel function logs

### Site Shows 404
- Check `vercel.json` configuration
- Verify build output directory is `dist/public`
- Check Vercel deployment logs

---

## 📞 Need Help?

1. Check `DEPLOYMENT.md` for detailed instructions
2. Review Vercel build/function logs
3. Test locally first: `npm run dev`

---

**🎉 You're all set! Your careers page should now be live on Vercel!**

