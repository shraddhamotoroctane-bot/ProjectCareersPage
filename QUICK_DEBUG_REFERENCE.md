# Quick Debug Reference: Local vs Vercel Issues

## 🚨 Top 5 Most Common Issues

### 1. Environment Variables Not Set in Vercel (90% of cases)
**Symptom**: Debug endpoint shows `allEnvVarsPresent: false`  
**Fix**: Add variables in Vercel Dashboard → Settings → Environment Variables → Redeploy

### 2. Private Key Format Issue
**Symptom**: Debug endpoint shows `GOOGLE_PRIVATE_KEY.startsWith: false`  
**Fix**: Ensure key includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

### 3. Variables Set But Not Available
**Symptom**: Variables exist in dashboard but debug shows `exists: false`  
**Fix**: **Redeploy** - variables only available to new deployments

### 4. Wrong Spreadsheet ID
**Symptom**: Debug shows `connectionTest.errorStatus: 404`  
**Fix**: Verify `GOOGLE_SHEET_ID` matches your actual spreadsheet ID

### 5. Service Account Permission Issue
**Symptom**: Debug shows `connectionTest.errorStatus: 403`  
**Fix**: Share Google Sheet with service account email (Editor access)

---

## 🔍 Debug Endpoint Quick Check

Visit: `https://your-app.vercel.app/api/debug/google-sheets`

### ✅ Healthy Output Should Show:
```json
{
  "summary": {
    "allEnvVarsPresent": true,
    "usingCorrectStorage": true,
    "connectionWorking": true,
    "recommendations": []  // Empty = no issues
  }
}
```

### ❌ Problem Indicators:
- `allEnvVarsPresent: false` → Missing environment variables
- `usingCorrectStorage: false` → Using MemoryStorage (fallback)
- `connectionWorking: false` → Authentication or permission issue
- `recommendations: [...]` → Read the recommendations array

---

## 📋 Environment Variable Checklist

In Vercel Dashboard → Settings → Environment Variables:

- [ ] `GOOGLE_SHEET_ID` - 40-50 character string
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Ends with `.iam.gserviceaccount.com`
- [ ] `GOOGLE_PRIVATE_KEY` - Includes BEGIN/END markers, 1700-2000 chars
- [ ] All variables enabled for **Production** environment
- [ ] Variables set for **Runtime** (not Build-time only)

**After adding/updating variables: REDEPLOY!**

---

## 🔍 Vercel Logs - What to Look For

### Success Pattern:
```
🔍 [DEBUG] ========== initializeSheets START ==========
✅ [DEBUG] All environment variables present
✅ [DEBUG] Google Sheets API client initialized
✅ [DEBUG] Authentication successful - spreadsheet accessible
✅ [DEBUG] ========== initializeSheets SUCCESS ==========
```

### Failure Pattern:
```
🔍 [DEBUG] ========== initializeSheets START ==========
❌ [DEBUG] Missing GOOGLE_SHEET_ID  // or other variable
❌ [DEBUG] ========== initializeSheets FAILED ==========
```

---

## 🎯 Step-by-Step Debugging

1. **Deploy** code with debug logs
2. **Visit** `/api/debug/google-sheets` endpoint
3. **Check** `summary.recommendations` array
4. **Review** `environmentVariables` section
5. **Fix** issues shown in recommendations
6. **Redeploy** after fixing
7. **Verify** debug endpoint shows all green

---

## 💡 Pro Tips

1. **Always redeploy** after adding/updating environment variables
2. **Copy private key exactly** from JSON file (don't modify)
3. **Verify service account** has Editor access to spreadsheet
4. **Check environment scope** (Production vs Preview)
5. **Use debug endpoint** as first diagnostic tool

---

## 🆘 Still Not Working?

Share this information:
1. Output from `/api/debug/google-sheets` endpoint
2. Logs from Vercel (especially initialization section)
3. What works locally vs what fails on Vercel
4. Any error messages from debug endpoint

The debug logs will pinpoint the exact issue!

