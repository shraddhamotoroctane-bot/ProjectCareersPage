# Diagnose Current 500 Error

Since all environment variables are set correctly, let's find the actual error.

## 🔍 Step 1: Check Debug Endpoint

Visit this URL and **copy the entire JSON response**:
```
https://project-careers-page-oicrxkjwt.vercel.app/api/debug/google-sheets
```

**What to look for:**
- `connectionTest.success: false` → Shows the actual error
- `connectionTest.error` → The error message
- `connectionTest.errorStatus` → HTTP status code (403 = permission, 404 = wrong ID)

## 🔍 Step 2: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" → Latest deployment
3. Click "Functions" → `api/index.ts`
4. Click "Logs" tab
5. Look for the most recent error

**Copy these log lines:**
- Any line with `❌ [DEBUG]`
- The error message from `=== ERROR FETCHING JOBS ===`
- Any `Authentication test failed` messages

## 🔍 Step 3: Common Issues When Env Vars Are Set

### Issue 1: Private Key Format (Most Common)

Even if the key "looks" correct, Vercel might be storing it wrong.

**Check in Debug Endpoint:**
- `GOOGLE_PRIVATE_KEY.containsEscapedNewlines` → Should be `true`
- `GOOGLE_PRIVATE_KEY.startsWith` → Should be `true`
- `GOOGLE_PRIVATE_KEY.endsWith` → Should be `true`

**If any are false:**
1. Delete `GOOGLE_PRIVATE_KEY` in Vercel
2. Get key from your JSON file
3. Paste as **SINGLE LINE** with `\n` (backslash-n)
4. Redeploy

### Issue 2: Service Account Permission

**Error in logs:** `403 Forbidden` or `PERMISSION_DENIED`

**Fix:**
1. Open your Google Sheet
2. Click "Share" button
3. Verify `areers21@carlogform.iam.gserviceaccount.com` is listed
4. Ensure it has **Editor** access (not Viewer)

### Issue 3: Wrong Spreadsheet ID

**Error in logs:** `404 Not Found`

**Fix:**
1. Open your Google Sheet
2. Copy the ID from URL: `https://docs.google.com/spreadsheets/d/{ID}/edit`
3. Verify it matches `GOOGLE_SHEET_ID` in Vercel
4. Update if different, redeploy

### Issue 4: Sheet Structure Issue

**Error in logs:** `Unable to parse range` or no data returned

**Fix:**
1. Verify your sheet has a tab named "Jobs"
2. Verify row 1 has headers
3. Verify data starts from row 2

## 📋 What I Need From You

Please share:

1. **Debug Endpoint Output:**
   - Visit: `https://project-careers-page-oicrxkjwt.vercel.app/api/debug/google-sheets`
   - Copy the entire JSON response

2. **Latest Vercel Logs:**
   - Copy the error messages (especially with `[DEBUG]` markers)
   - Look for lines starting with `❌`

3. **Private Key Format Check:**
   - In Vercel, click the eye icon to reveal `GOOGLE_PRIVATE_KEY`
   - Does it show `\n` (backslash-n) or actual line breaks?
   - What does the first line look like?

With this information, I can tell you exactly what's wrong!

