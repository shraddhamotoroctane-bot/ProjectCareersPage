# Google Sheets Production Debugging Guide

This guide will help you systematically debug Google Sheets integration issues in production (Vercel) using the comprehensive debug logs we've added.

## 🔍 Step 1: Access the Debug Endpoint

After deploying to Vercel, visit your debug endpoint:

```
https://your-app.vercel.app/api/debug/google-sheets
```

This endpoint provides a comprehensive analysis of:
- Environment variable validation
- Storage type detection
- Connection test results
- Internal state inspection
- Actionable recommendations

**What to look for:**
1. Check `summary.allEnvVarsPresent` - should be `true`
2. Check `summary.usingCorrectStorage` - should be `true`
3. Check `summary.connectionWorking` - should be `true`
4. Review `summary.recommendations` array for issues

## 📋 Step 2: Check Environment Variables in Vercel

### Access Vercel Environment Variables:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Verify these three variables exist:

### Required Variables:

#### 1. `GOOGLE_SHEET_ID`
- **Format**: String (e.g., `1_xXLokhPbeqs8NdMxpV4WZJvdztZ6Wu-Q5m4S_Jbjlg`)
- **How to get**: Extract from Google Sheets URL between `/d/` and `/edit`
- **Validation**: Should be 40-50 characters long
- **Example**: `1_xXLokhPbeqs8NdMxpV4WZJvdztZ6Wu-Q5m4S_Jbjlg`

#### 2. `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- **Format**: Email address ending with `.iam.gserviceaccount.com`
- **How to get**: From your Google Cloud service account JSON file (field: `client_email`)
- **Validation**: Must contain `@` and end with `.iam.gserviceaccount.com`
- **Example**: `your-service-account@your-project.iam.gserviceaccount.com`

#### 3. `GOOGLE_PRIVATE_KEY`
- **Format**: Multi-line string with BEGIN/END markers
- **How to get**: From your Google Cloud service account JSON file (field: `private_key`)
- **Critical**: Must include the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- **Newline handling**: Vercel supports both escaped (`\n`) and actual newlines
- **Example format**:
  ```
  -----BEGIN PRIVATE KEY-----
  MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
  (multiple lines of base64)
  -----END PRIVATE KEY-----
  ```

### Common Environment Variable Issues:

1. **Missing variables**: Check debug endpoint `environmentVariables` section
2. **Wrong format**: Private key missing BEGIN/END markers
3. **Truncated values**: Check `length` field in debug endpoint
4. **Copy-paste errors**: Verify first/last characters match expected format

## 📊 Step 3: Access Vercel Function Logs

### Method 1: Vercel Dashboard
1. Go to your Vercel project
2. Click on **Deployments** tab
3. Click on the latest deployment
4. Click on **Functions** tab
5. Click on your function (usually `api/index.ts`)
6. View **Logs** tab

### Method 2: Vercel CLI
```bash
vercel logs [deployment-url] --follow
```

### Method 3: Real-time Logs
1. In Vercel dashboard, go to your project
2. Click **Logs** in the sidebar
3. Filter by function name or search for `[DEBUG]`

## 🔎 Step 4: Interpret Debug Logs

### Log Markers:
- `🔍 [DEBUG]` - Informational debug logs
- `✅ [DEBUG]` - Successful operations
- `❌ [DEBUG]` - Errors and failures
- `⚠️ [DEBUG]` - Warnings

### Key Log Sections to Check:

#### 1. Initialization Logs
Look for: `========== initializeSheets START ==========`

**What to check:**
- Environment variable validation output
- Private key processing (newline handling)
- JWT auth object creation
- Authentication test results

**Common issues:**
- `Missing GOOGLE_SHEET_ID` → Variable not set in Vercel
- `Missing Google Sheets credentials` → Service account email or private key missing
- `Authentication test failed` → Check service account permissions

#### 2. API Call Logs
Look for: `========== readSheet START ==========`

**What to check:**
- Request parameters (spreadsheet ID, range)
- Response structure
- Error details if call fails

**Common issues:**
- `403 Forbidden` → Service account doesn't have access to spreadsheet
- `404 Not Found` → Spreadsheet ID incorrect or sheet doesn't exist
- `400 Bad Request` → Range format incorrect

#### 3. Job Fetching Logs
Look for: `========== getAllJobs START ==========`

**What to check:**
- Number of rows read
- Parsing errors
- Active jobs count

**Common issues:**
- `0 rows read` → Sheet empty or range incorrect
- `Error parsing row` → Data format issue in sheet

## 🧪 Step 5: Test Locally First

Before deploying, test locally:

1. **Set up local environment variables:**
   ```bash
   # Create .env file
   GOOGLE_SHEET_ID=your-sheet-id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

2. **Run locally:**
   ```bash
   npm run dev
   ```

3. **Test debug endpoint:**
   ```
   http://localhost:5000/api/debug/google-sheets
   ```

4. **Check console logs** for detailed debug output

5. **If local works but production doesn't:**
   - Compare environment variable formats
   - Check Vercel environment variable settings
   - Verify service account has spreadsheet access

## 🔧 Step 6: Common Production Issues & Solutions

### Issue 1: Using MemoryStorage Instead of GoogleSheetsStorage

**Symptoms:**
- Debug endpoint shows `storage.type: "MemoryStorage"`
- No jobs appear on website
- Health endpoint shows `usingMemoryStorage: true`

**Solution:**
- Check all three environment variables are set in Vercel
- Verify variable names are exact (case-sensitive)
- Redeploy after setting variables

### Issue 2: Authentication Fails

**Symptoms:**
- Logs show: `❌ [DEBUG] Authentication test failed`
- Error code: `403` or `401`

**Solution:**
1. Verify service account email matches the one shared with spreadsheet
2. Check spreadsheet sharing settings:
   - Open Google Sheet
   - Click "Share" button
   - Ensure service account email has "Editor" access
3. Verify private key is complete and correctly formatted

### Issue 3: Spreadsheet Not Found

**Symptoms:**
- Error: `404 Not Found`
- Error message mentions spreadsheet ID

**Solution:**
1. Verify `GOOGLE_SHEET_ID` is correct
2. Extract ID from Google Sheets URL: `https://docs.google.com/spreadsheets/d/{ID}/edit`
3. Ensure spreadsheet exists and is accessible

### Issue 4: Private Key Format Issues

**Symptoms:**
- Error: `Invalid key format`
- Authentication fails immediately

**Solution:**
1. Copy entire private key from JSON file
2. Include both `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
3. In Vercel, paste as-is (supports both `\n` and actual newlines)
4. Verify in debug endpoint that `startsWith` and `endsWith` are `true`

### Issue 5: Sheet Range Errors

**Symptoms:**
- Error: `Unable to parse range`
- Jobs not loading

**Solution:**
1. Verify sheet named "Jobs" exists in spreadsheet
2. Check sheet has headers in row 1
3. Ensure data starts from row 2
4. Verify range format: `Jobs!A2:L1000`

## 📝 Step 7: Collect Information for Further Debugging

When reporting issues, collect:

1. **Debug endpoint output:**
   ```bash
   curl https://your-app.vercel.app/api/debug/google-sheets
   ```

2. **Relevant log snippets:**
   - Copy logs from `initializeSheets START` to `initializeSheets END`
   - Copy any error logs with `❌ [DEBUG]` markers

3. **Environment variable status (sanitized):**
   - From debug endpoint `environmentVariables` section
   - Remove actual values, keep structure

4. **Error details:**
   - Error message
   - Error code
   - Error status
   - Stack trace (if available)

## 🎯 Step 8: Systematic Debugging Checklist

Use this checklist to narrow down the issue:

- [ ] All three environment variables exist in Vercel
- [ ] Environment variable names are exact (case-sensitive)
- [ ] `GOOGLE_SHEET_ID` is correct (extracted from URL)
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL` ends with `.iam.gserviceaccount.com`
- [ ] `GOOGLE_PRIVATE_KEY` includes BEGIN/END markers
- [ ] Service account email has Editor access to spreadsheet
- [ ] Spreadsheet has "Jobs" sheet with data
- [ ] Debug endpoint shows `allEnvVarsPresent: true`
- [ ] Debug endpoint shows `usingCorrectStorage: true`
- [ ] Debug endpoint shows `connectionWorking: true`
- [ ] Vercel logs show successful initialization
- [ ] Vercel logs show successful API calls

## 🚀 Next Steps

1. **Deploy the updated code** with debug logs
2. **Visit the debug endpoint** to see current state
3. **Check Vercel logs** for detailed debug output
4. **Compare** local vs production behavior
5. **Share debug endpoint output** and relevant logs for further assistance

## 📞 Getting Help

When asking for help, provide:
1. Output from `/api/debug/google-sheets` endpoint
2. Relevant log snippets from Vercel (especially initialization logs)
3. What works locally vs what fails in production
4. Any error messages you're seeing

The debug logs will show exactly where the failure occurs, making it much easier to identify and fix the issue.

