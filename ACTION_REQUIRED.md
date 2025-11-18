# 🚨 ACTION REQUIRED: Fix Private Key in Vercel

The API calls are still failing because the **private key format in Vercel is incorrect**.

## ✅ What I've Done:

1. ✅ Enhanced the code to try 4 different key formats automatically
2. ✅ Added comprehensive debug logging
3. ✅ Improved error messages with specific fix instructions
4. ✅ Code is deployed and ready

## 🔴 What YOU Need to Do NOW:

### Step 1: Check Current Key Format

Visit your debug endpoint:
```
https://project-careers-page-oicrxkjwt.vercel.app/api/debug/google-sheets
```

Look at `environmentVariables.GOOGLE_PRIVATE_KEY`:
- If `containsEscapedNewlines: false` → **This is the problem!**
- If `startsWith: false` or `endsWith: false` → **This is the problem!**

### Step 2: Fix the Private Key in Vercel

**CRITICAL**: The key MUST be pasted as a **SINGLE LINE with `\n` (backslash-n)**

1. **Go to Vercel Dashboard**
   - Your Project → Settings → Environment Variables

2. **Delete the existing `GOOGLE_PRIVATE_KEY`**
   - Click the three dots → Delete

3. **Create a NEW `GOOGLE_PRIVATE_KEY`**
   - Click "Add New"
   - Name: `GOOGLE_PRIVATE_KEY`
   - Value: Paste your key as **ONE LINE** with `\n` instead of actual newlines

4. **Format Example** (all on one line):
   ```
   -----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDI4kjo3Vj3qVAP\nC0KDt3vQSzPTuyS1sX9vE3Kn16PTXqSPVatZkKy+0YMy8JsoiYsiCWQHGQmeKyHW\nDtoDrcB+iwKU79rP2gJPFJaiujtk/6tI7J5/HxskG2fbvVNP2dbyAx85fvKHH9hP\njeD3aDmeC9gwFVyW6V+vWkJlnxCq1xIMf33ONUaBYq67eY0Ho5D+9cRbGZ1Bntxt\nplrHb6J/Uw1RalwHc64pQ5nd5J6Ks50UMcY238LRemvpucmFN2T69JdpzUN30fe8\ndVwYw8ZSSONbC7UwTIhc3kjtzerF9BeBOUeKrHQaXwhTt/shamIE5p+6A/+m6Kuu\njWNBO8ilAgMBAAECggEAB5et48dB7pJiqT7ms63Cqzu8aLtBBvD/fQZCJh/bXEjO\ndXBqeociUFAA4nL/mkegj5fFRRNoLqc4ryt+h/cQOHguj8yE+6gkwDJqAxqA1i9n\nnOj8kJdvYiz6/u4n8POt0RXXH0gyCHNmrJMTNqakztlpwV99UWLer/T8X3Tkn2BS\nbhQbVpoY9kHcNDlS/y+4Vfm0v3A7DneJEz813YdnBBOOSixqeYPRXDR7a5mV+LYJ\nA4NW2uDyzay3Nt/qz2gOvLOogqDJZhLpqVupYi9fJVJXQ8kSZhFuJfc4ub7xawez\nYQdhGDG7woq+eJ1aRGDcgYZytTsCPKh+HAJXfA6HvQKBgQDvw/6qUFiMRPTZ/hR2\nWqFFwDgBQkEB0bQflUtoZfiJxyX8Fu/wa02pqj/oHdJFinj++WBv3C4ShaAvwCAB\nWX5T5lIBmyUWMj1kcw6uLAwVlo+iJ+uQVmyibWAGubKzrcLCnujXig6F19f1VKIi\nn2Vasl27vrT5XXvWSSD+j1ub0wKBgQDWfFRyD9oV3x8iJBItq5dgDNGH3LK6yKJW\nCJcwUJdjmWv4WU6iznM7yVcIqOuiqMshaDDmF746GhZLFl0lxe+fAZPjL/uUBFV0\nkEQv2j44DR0iY1sI7o/8UlyZH/y1s7kyFTATcbNUPRnvMzE+9NRCS7fkHkVC4oQC\nGGFjGncWpwKBgDa8Bnn45431+/N71k4CeIiEzgQzjMWOitEe8tz9UlSZmulGjzXS\nOSN/UyF5FVR8vQxv/3zpxbbCvIPKF0RXmsgqbxQgx8GebHdu8K4ALi4LdfStqlAD\n+r7Fu0Mtx0bPZwOo5Ty3LoONd6Zw0KaYvrmKuG0wpv26Qpfzj82tCluzAoGBALxO\nl800gaHmLG1LAfK6zcH0Pxlq+Dfo4i1qiWJPvzogfpyhu9pQKvd4g0MFGyvJyd1g\nnl3Exqw4Lw5pago5x3Dwb6hsfhGr5GLcLiFdGHcZfFSuqkQjPqKmpMmDPdlBGv0P\ngQ/xKSJyKozJgxjk1l4GIELVGLXqLT+xq/7YQ2nNAoGBALGt5G7vcn/Nx2t0qc5X\nkOnuzymKp6ygF1fFvp7vAcmMLc841av6dXvXRjq7RKldJ1cClmwm/iisiB4WH7r4\nfnOz7tD0cTuGIPp97WWHNtnqjqKFM5TfhvVnNy874XKGdBI5nG6XvpVe8lDlqfsX\nD77BfIP3yZV2Pc/Z7evH1ylu\n-----END PRIVATE KEY-----\n
   ```

5. **Save and Redeploy**
   - After saving, go to Deployments
   - Click "Redeploy" on the latest deployment
   - OR push a new commit to trigger deployment

### Step 3: Verify It Works

After redeploying, check:

1. **Debug Endpoint**: `https://project-careers-page-oicrxkjwt.vercel.app/api/debug/google-sheets`
   - Should show: `connectionWorking: true`
   - Should show: `GOOGLE_PRIVATE_KEY.containsEscapedNewlines: true`

2. **Vercel Logs**: Look for:
   ```
   ✅ [DEBUG] JWT auth object created successfully
   ✅ [DEBUG] Google Sheets authentication successful
   ```

3. **API Endpoint**: `https://project-careers-page-oicrxkjwt.vercel.app/api/jobs`
   - Should return job data, not 500 error

## 🔍 How to Get the Correct Format:

1. Open your `google-service-account.json` file
2. Find the `private_key` field
3. Copy the **entire value** (it will have `\n` in it from JSON)
4. Paste it **exactly as-is** into Vercel (as one line)

The JSON format already has `\n` which is what Vercel needs!

## ⚠️ Common Mistakes:

- ❌ Pasting with actual newlines (multi-line)
- ❌ Removing the `\n` characters
- ❌ Adding extra spaces
- ❌ Not redeploying after updating

## ✅ Success Indicators:

After fixing, you should see:
- ✅ Debug endpoint shows `connectionWorking: true`
- ✅ `/api/jobs` returns job data
- ✅ No more 500 errors
- ✅ Logs show "JWT auth object created successfully"

**The code is ready - you just need to fix the key format in Vercel!**

