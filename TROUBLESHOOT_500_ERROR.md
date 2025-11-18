# Troubleshooting 500 Internal Server Error

The browser is showing `500 Internal Server Error` on `/api/jobs`. Let's diagnose this step by step.

## 🔍 Step 1: Check Vercel Logs

The debug logs we added will show exactly what's failing.

### How to Check Vercel Logs:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project: `project-careers-page`

2. **View Latest Deployment**
   - Click on "Deployments" tab
   - Click on the latest deployment (should be recent)

3. **Check Function Logs**
   - Click on "Functions" tab
   - Click on `api/index.ts` (or similar)
   - Click on "Logs" tab

4. **Look for Debug Markers**
   - Search for `[DEBUG]` in the logs
   - Look for `❌ [DEBUG]` errors
   - Copy the error messages you see

## 🔍 Step 2: Check Debug Endpoint

Visit this URL in your browser:
```
https://project-careers-page-oicrxkjwt.vercel.app/api/debug/google-sheets
```

This will show you:
- ✅ Which environment variables are set
- ✅ Private key format analysis
- ✅ Connection test results
- ✅ Specific recommendations

**What to look for:**
- `connectionWorking: false` → Authentication issue
- `GOOGLE_PRIVATE_KEY.containsEscapedNewlines: false` → Key format issue
- `GOOGLE_PRIVATE_KEY.startsWith: false` → Missing BEGIN marker

## 🔍 Step 3: Common Issues & Fixes

### Issue 1: Latest Code Not Deployed

**Check:**
- Go to Vercel → Deployments
- Is the latest deployment from after we pushed the fixes?
- Does it show commit `ebae0c1` or later?

**Fix:**
- If not, trigger a new deployment:
  - Push a new commit, OR
  - Click "Redeploy" in Vercel

### Issue 2: Private Key Format Still Wrong

**Check in Debug Endpoint:**
- `GOOGLE_PRIVATE_KEY.containsEscapedNewlines: false`
- `GOOGLE_PRIVATE_KEY.startsWith: false`

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Delete `GOOGLE_PRIVATE_KEY`
3. Create new one
4. Paste key as **SINGLE LINE with `\n`**:
   ```
   -----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n
   ```
5. Redeploy

### Issue 3: Environment Variables Not Set

**Check in Debug Endpoint:**
- `allEnvVarsPresent: false`

**Fix:**
- Set all three variables in Vercel:
  - `GOOGLE_SHEET_ID`
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
  - `GOOGLE_PRIVATE_KEY`
- Redeploy

### Issue 4: Service Account Permission Issue

**Check in Vercel Logs:**
- Look for: `403 Forbidden` or `PERMISSION_DENIED`

**Fix:**
1. Open your Google Sheet
2. Click "Share" button
3. Add service account email: `areers21@carlogform.iam.gserviceaccount.com`
4. Give it "Editor" access

## 📋 What to Share for Help

If you need help, share:

1. **Debug Endpoint Output:**
   - Visit: `https://project-careers-page-oicrxkjwt.vercel.app/api/debug/google-sheets`
   - Copy the entire JSON response

2. **Vercel Logs:**
   - Copy the error messages with `[DEBUG]` markers
   - Especially look for:
     - `❌ [DEBUG] All authentication approaches failed`
     - `❌ [DEBUG] Private key format error`
     - `❌ [DEBUG] Authentication test failed`

3. **Latest Deployment Info:**
   - Commit hash
   - Deployment time

## ✅ Expected Success Logs

When it's working, you should see:
```
✅ [DEBUG] JWT auth object created successfully
✅ [DEBUG] Google Sheets authentication successful
✅ [DEBUG] Read X rows from Jobs sheet
```

## 🚀 Quick Fix Checklist

- [ ] Latest code deployed (check commit hash)
- [ ] All 3 environment variables set in Vercel
- [ ] Private key pasted as single line with `\n`
- [ ] Service account has Editor access to sheet
- [ ] Redeployed after making changes
- [ ] Checked debug endpoint output
- [ ] Checked Vercel function logs

The debug logs will tell you exactly what's wrong!

