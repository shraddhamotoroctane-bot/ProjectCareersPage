# Common Issues: Working Locally but Failing on Vercel

This document explains the most common reasons why Google Sheets integration works locally but fails on Vercel, and how to identify them using the debug logs.

## 🔴 Issue 1: Environment Variables Not Set in Vercel

### Symptoms:
- ✅ Works perfectly locally
- ❌ Fails on Vercel with "Missing Google Sheets credentials"
- Debug endpoint shows `allEnvVarsPresent: false`

### Root Cause:
Environment variables in `.env` file are **NOT automatically deployed** to Vercel. They must be set separately in Vercel dashboard.

### How Debug Logs Will Show It:
```json
{
  "environmentVariables": {
    "GOOGLE_SHEET_ID": {
      "exists": false,  // ❌ This will be false
      "length": 0
    },
    "GOOGLE_SERVICE_ACCOUNT_EMAIL": {
      "exists": false  // ❌ This will be false
    },
    "GOOGLE_PRIVATE_KEY": {
      "exists": false  // ❌ This will be false
    }
  },
  "storage": {
    "type": "MemoryStorage"  // ❌ Using fallback storage
  }
}
```

### Log Output:
```
🔍 [DEBUG] Environment check: {
  hasGOOGLE_SHEET_ID: false,  // ❌
  hasGOOGLE_SERVICE_ACCOUNT_EMAIL: false,  // ❌
  hasGOOGLE_PRIVATE_KEY: false  // ❌
}
⚠️ Using MemoryStorage - Google Sheets credentials not found
```

### Solution:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all three variables:
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
3. **Redeploy** after adding variables (they're only available to new deployments)

---

## 🔴 Issue 2: Private Key Newline Format Mismatch

### Symptoms:
- ✅ Works locally (reads from `.env` with actual newlines)
- ❌ Fails on Vercel with "Invalid key format" or authentication errors
- Debug endpoint shows `GOOGLE_PRIVATE_KEY.isValid: false`

### Root Cause:
- **Local**: `.env` file can have actual newlines (`\n`)
- **Vercel**: Environment variables are stored as strings, may need escaped newlines (`\\n`)

### How Debug Logs Will Show It:
```json
{
  "environmentVariables": {
    "GOOGLE_PRIVATE_KEY": {
      "exists": true,
      "startsWith": false,  // ❌ Missing BEGIN marker
      "endsWith": false,    // ❌ Missing END marker
      "containsEscapedNewlines": true,  // Has \n but not processed
      "containsActualNewlines": false   // No actual newlines
    }
  }
}
```

### Log Output:
```
🔍 [DEBUG] - GOOGLE_PRIVATE_KEY: {
  startsWith: false,  // ❌ Should be true
  endsWith: false,    // ❌ Should be true
  containsEscapedNewlines: true,
  containsActualNewlines: false
}
❌ [DEBUG] Authentication test failed: {
  message: "Invalid key format",
  code: "invalid_grant"
}
```

### Solution:
**Option A: Use Escaped Newlines in Vercel**
When pasting into Vercel, ensure the private key has `\n` (backslash-n) instead of actual newlines:
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

**Option B: Use Actual Newlines (Vercel supports both)**
Paste the key exactly as it appears in your JSON file - Vercel will handle it:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
```

**Check in Debug Endpoint:**
After fixing, verify `startsWith: true` and `endsWith: true` in the debug output.

---

## 🔴 Issue 3: Environment Variables Set But Not Available to Deployment

### Symptoms:
- ✅ Variables are set in Vercel dashboard
- ❌ Still fails with "Missing credentials"
- Debug endpoint shows variables don't exist

### Root Cause:
Environment variables are only available to **new deployments** after they're set. Old deployments don't have access to newly added variables.

### How Debug Logs Will Show It:
```
🔍 [DEBUG] Environment check: {
  hasGOOGLE_SHEET_ID: false,  // ❌ Even though set in dashboard
  hasGOOGLE_SERVICE_ACCOUNT_EMAIL: false,
  hasGOOGLE_PRIVATE_KEY: false
}
```

### Solution:
1. Verify variables are set in Vercel dashboard
2. **Trigger a new deployment** (push to git or click "Redeploy")
3. Check the deployment logs to confirm variables are loaded

---

## 🔴 Issue 4: Private Key Truncated or Corrupted During Copy-Paste

### Symptoms:
- ✅ Works locally
- ❌ Fails on Vercel with authentication errors
- Debug endpoint shows `length` is shorter than expected

### Root Cause:
When copying the private key from JSON file to Vercel, it might get:
- Truncated (missing characters)
- Corrupted (special characters replaced)
- Missing BEGIN/END markers

### How Debug Logs Will Show It:
```json
{
  "environmentVariables": {
    "GOOGLE_PRIVATE_KEY": {
      "exists": true,
      "length": 1500,  // ❌ Should be ~1700-2000 characters
      "startsWith": false,  // ❌ Missing BEGIN marker
      "endsWith": false     // ❌ Missing END marker
    }
  }
}
```

### Log Output:
```
🔍 [DEBUG] - GOOGLE_PRIVATE_KEY: {
  length: 1500,  // ❌ Too short (should be ~1700-2000)
  startsWith: false,
  endsWith: false
}
❌ [DEBUG] Private key processing: {
  startsWithCorrect: false,  // ❌
  endsWithCorrect: false    // ❌
}
```

### Solution:
1. Open your service account JSON file
2. Copy the **entire** `private_key` value (including quotes if present)
3. Paste into Vercel exactly as-is
4. Verify in debug endpoint:
   - `length` should be 1700-2000 characters
   - `startsWith: true`
   - `endsWith: true`

---

## 🔴 Issue 5: Spreadsheet ID Mismatch

### Symptoms:
- ✅ Works locally (using correct sheet ID)
- ❌ Fails on Vercel with "404 Not Found"
- Debug endpoint shows different spreadsheet ID

### Root Cause:
Different spreadsheet ID set in Vercel vs local `.env` file.

### How Debug Logs Will Show It:
```json
{
  "environmentVariables": {
    "GOOGLE_SHEET_ID": {
      "exists": true,
      "length": 45,
      "preview": "1_WRONG_ID_HERE_abc123...",  // ❌ Wrong ID
      "isValid": true
    }
  },
  "connectionTest": {
    "success": false,
    "error": "Unable to parse range",
    "errorStatus": 404  // ❌ Not found
  }
}
```

### Log Output:
```
🔍 [DEBUG] Spreadsheet ID: 1_WRONG_ID_HERE_abc123...
❌ [DEBUG] Authentication test failed: {
  message: "Unable to parse range",
  status: 404,
  errorDetails: { "error": "Requested entity was not found." }
}
```

### Solution:
1. Verify the correct spreadsheet ID from your Google Sheets URL
2. Update `GOOGLE_SHEET_ID` in Vercel
3. Redeploy
4. Check debug endpoint shows correct ID in `preview` field

---

## 🔴 Issue 6: Service Account Email Mismatch

### Symptoms:
- ✅ Works locally
- ❌ Fails on Vercel with "403 Forbidden" or "Permission denied"
- Debug endpoint shows different email

### Root Cause:
Different service account email in Vercel, or the email doesn't have access to the spreadsheet.

### How Debug Logs Will Show It:
```json
{
  "environmentVariables": {
    "GOOGLE_SERVICE_ACCOUNT_EMAIL": {
      "exists": true,
      "preview": "wrong-email@project.iam.gserviceaccount.com",  // ❌ Wrong email
      "endsWithServiceAccount": true,
      "isValid": true
    }
  },
  "connectionTest": {
    "success": false,
    "error": "The caller does not have permission",
    "errorStatus": 403  // ❌ Forbidden
  }
}
```

### Log Output:
```
🔍 [DEBUG] - GOOGLE_SERVICE_ACCOUNT_EMAIL: {
  preview: "wrong-email@project.iam.gserviceaccount.com",  // ❌
  endsWithServiceAccount: true
}
❌ [DEBUG] Authentication test failed: {
  message: "The caller does not have permission",
  status: 403,
  errorDetails: { "error": "PERMISSION_DENIED" }
}
```

### Solution:
1. Check your service account JSON file for the correct `client_email`
2. Verify this email has **Editor** access to your Google Sheet:
   - Open Google Sheet
   - Click "Share" button
   - Ensure service account email is listed with "Editor" role
3. Update `GOOGLE_SERVICE_ACCOUNT_EMAIL` in Vercel if different
4. Redeploy

---

## 🔴 Issue 7: Environment Variable Scope (Production vs Preview)

### Symptoms:
- ✅ Works in Preview deployments
- ❌ Fails in Production
- Or vice versa

### Root Cause:
Vercel allows setting environment variables for specific environments (Production, Preview, Development).

### How Debug Logs Will Show It:
```
🔍 [DEBUG] Environment: production  // or preview
🔍 [DEBUG] Environment check: {
  hasGOOGLE_SHEET_ID: false,  // ❌ Not set for this environment
  ...
}
```

### Solution:
1. Go to Vercel → Settings → Environment Variables
2. For each variable, check which environments it's enabled for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
3. Enable for the environment you're deploying to
4. Redeploy

---

## 🔴 Issue 8: Build-Time vs Runtime Variables

### Symptoms:
- ✅ Variables visible during build
- ❌ Variables not available at runtime
- Debug endpoint shows variables missing

### Root Cause:
Some variables might be set as "Build-time only" instead of "Runtime".

### Solution:
1. Go to Vercel → Settings → Environment Variables
2. For each Google Sheets variable, ensure it's set for **Runtime** (not Build-time only)
3. Google Sheets variables should be available at runtime, not build-time

---

## 🔴 Issue 9: Vercel Function Timeout

### Symptoms:
- ✅ Works locally (fast response)
- ❌ Fails on Vercel with timeout errors
- Logs show operation starts but never completes

### Root Cause:
Vercel serverless functions have execution time limits. Google Sheets API calls might be slow on cold starts.

### How Debug Logs Will Show It:
```
🔍 [DEBUG] ========== initializeSheets START ==========
🔍 [DEBUG] Testing authentication by checking spreadsheet access...
// ... no completion log, function times out
```

### Solution:
1. Check `vercel.json` - ensure `maxDuration` is set appropriately:
   ```json
   {
     "functions": {
       "api/index.ts": {
         "maxDuration": 30
       }
     }
   }
   ```
2. For Pro/Enterprise plans, you can increase timeout
3. Consider optimizing Google Sheets API calls (cache results, batch operations)

---

## 🔴 Issue 10: Network/Firewall Restrictions

### Symptoms:
- ✅ Works locally
- ❌ Fails on Vercel with network errors
- Error: "ECONNREFUSED" or "ETIMEDOUT"

### Root Cause:
Vercel's serverless functions might have network restrictions or Google APIs might be blocked.

### How Debug Logs Will Show It:
```
❌ [DEBUG] Authentication test failed: {
  message: "getaddrinfo ENOTFOUND sheets.googleapis.com",
  code: "ENOTFOUND"
}
```

### Solution:
1. This is rare, but check Vercel's network policies
2. Verify Google Sheets API is accessible from Vercel's regions
3. Check if you're using Vercel's firewall or IP restrictions

---

## 📊 Quick Diagnostic Checklist

Use this checklist with your debug endpoint output:

- [ ] **Environment Variables Exist**: All three show `exists: true`
- [ ] **Correct Storage Type**: `storage.type === "GoogleSheetsStorage"`
- [ ] **Private Key Format**: `startsWith: true` AND `endsWith: true`
- [ ] **Private Key Length**: `length` is 1700-2000 characters
- [ ] **Service Account Email**: `endsWithServiceAccount: true`
- [ ] **Spreadsheet ID**: Matches your actual sheet ID
- [ ] **Connection Test**: `connectionTest.success === true`
- [ ] **No Recommendations**: `summary.recommendations` array is empty

---

## 🎯 Most Common Issue: #1 (Variables Not Set)

**90% of "works locally but not on Vercel" issues** are because environment variables aren't set in Vercel dashboard.

**Quick Fix:**
1. Check `/api/debug/google-sheets` endpoint
2. If `allEnvVarsPresent: false`, add missing variables in Vercel
3. Redeploy

The debug logs will tell you exactly which variable is missing or incorrect!

