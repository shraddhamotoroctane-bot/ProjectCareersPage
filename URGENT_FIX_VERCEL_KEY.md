# URGENT: Fix Private Key in Vercel

The OpenSSL decoder error is still happening. Here's the **immediate fix**:

## 🔴 Quick Fix: Re-paste Private Key as Single Line

The issue is likely how Vercel is storing the key. Try this:

### Step 1: Get Your Private Key
1. Open your `google-service-account.json` file
2. Find the `private_key` field
3. Copy the **entire value** (it will have `\n` in it)

### Step 2: Convert to Single Line Format
1. Take the key you copied
2. It should look like this in JSON:
   ```
   "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n"
   ```
3. Copy **just the value** (without the quotes)
4. It should have `\n` (backslash-n) in it

### Step 3: Update in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. **Delete** the existing `GOOGLE_PRIVATE_KEY` variable
3. **Create a new one** with the same name
4. **Paste the key as a SINGLE LINE** (with `\n` in it, not actual newlines)
5. It should look like this (all on one line):
   ```
   -----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDI4kjo3Vj3qVAP\nC0KDt3vQSzPTuyS1sX9vE3Kn16PTXqSPVatZkKy+0YMy8JsoiYsiCWQHGQmeKyHW\nDtoDrcB+iwKU79rP2gJPFJaiujtk/6tI7J5/HxskG2fbvVNP2dbyAx85fvKHH9hP\njeD3aDmeC9gwFVyW6V+vWkJlnxCq1xIMf33ONUaBYq67eY0Ho5D+9cRbGZ1Bntxt\nplrHb6J/Uw1RalwHc64pQ5nd5J6Ks50UMcY238LRemvpucmFN2T69JdpzUN30fe8\ndVwYw8ZSSONbC7UwTIhc3kjtzerF9BeBOUeKrHQaXwhTt/shamIE5p+6A/+m6Kuu\njWNBO8ilAgMBAAECggEAB5et48dB7pJiqT7ms63Cqzu8aLtBBvD/fQZCJh/bXEjO\ndXBqeociUFAA4nL/mkegj5fFRRNoLqc4ryt+h/cQOHguj8yE+6gkwDJqAxqA1i9n\nnOj8kJdvYiz6/u4n8POt0RXXH0gyCHNmrJMTNqakztlpwV99UWLer/T8X3Tkn2BS\nbhQbVpoY9kHcNDlS/y+4Vfm0v3A7DneJEz813YdnBBOOSixqeYPRXDR7a5mV+LYJ\nA4NW2uDyzay3Nt/qz2gOvLOogqDJZhLpqVupYi9fJVJXQ8kSZhFuJfc4ub7xawez\nYQdhGDG7woq+eJ1aRGDcgYZytTsCPKh+HAJXfA6HvQKBgQDvw/6qUFiMRPTZ/hR2\nWqFFwDgBQkEB0bQflUtoZfiJxyX8Fu/wa02pqj/oHdJFinj++WBv3C4ShaAvwCAB\nWX5T5lIBmyUWMj1kcw6uLAwVlo+iJ+uQVmyibWAGubKzrcLCnujXig6F19f1VKIi\nn2Vasl27vrT5XXvWSSD+j1ub0wKBgQDWfFRyD9oV3x8iJBItq5dgDNGH3LK6yKJW\nCJcwUJdjmWv4WU6iznM7yVcIqOuiqMshaDDmF746GhZLFl0lxe+fAZPjL/uUBFV0\nkEQv2j44DR0iY1sI7o/8UlyZH/y1s7kyFTATcbNUPRnvMzE+9NRCS7fkHkVC4oQC\nGGFjGncWpwKBgDa8Bnn45431+/N71k4CeIiEzgQzjMWOitEe8tz9UlSZmulGjzXS\nOSN/UyF5FVR8vQxv/3zpxbbCvIPKF0RXmsgqbxQgx8GebHdu8K4ALi4LdfStqlAD\n+r7Fu0Mtx0bPZwOo5Ty3LoONd6Zw0KaYvrmKuG0wpv26Qpfzj82tCluzAoGBALxO\nl800gaHmLG1LAfK6zcH0Pxlq+Dfo4i1qiWJPvzogfpyhu9pQKvd4g0MFGyvJyd1g\nnl3Exqw4Lw5pago5x3Dwb6hsfhGr5GLcLiFdGHcZfFSuqkQjPqKmpMmDPdlBGv0P\ngQ/xKSJyKozJgxjk1l4GIELVGLXqLT+xq/7YQ2nNAoGBALGt5G7vcn/Nx2t0qc5X\nkOnuzymKp6ygF1fFvp7vAcmMLc841av6dXvXRjq7RKldJ1cClmwm/iisiB4WH7r4\nfnOz7tD0cTuGIPp97WWHNtnqjqKFM5TfhvVnNy874XKGdBI5nG6XvpVe8lDlqfsX\nD77BfIP3yZV2Pc/Z7evH1ylu\n-----END PRIVATE KEY-----\n
   ```

### Step 4: Redeploy
1. After updating the variable, **trigger a new deployment**
2. Either push a commit or click "Redeploy" in Vercel

### Step 5: Check Logs
After deployment, check Vercel logs for:
```
🔍 [DEBUG] Original private key analysis: {
  hasBackslashN: true,  // Should be true
  hasActualNewline: false  // Should be false if you pasted as single line
}
🔍 [DEBUG] Private key contains escaped newlines (\n), replacing...
✅ [DEBUG] JWT auth object created successfully
```

## 🔍 Alternative: Check Current Key Format

If you want to see what format Vercel currently has:

1. Visit: `https://your-app.vercel.app/api/debug/google-sheets`
2. Look at `environmentVariables.GOOGLE_PRIVATE_KEY`:
   - `containsEscapedNewlines: true` = Good (has `\n`)
   - `containsActualNewlines: true` = Might cause issues
   - `startsWith: false` or `endsWith: false` = Problem!

## ✅ Expected Result

After fixing, you should see in logs:
```
✅ [DEBUG] JWT auth object created successfully using: Direct processed key
✅ [DEBUG] Google Sheets authentication successful
```

And the `/api/jobs` endpoint should work!

