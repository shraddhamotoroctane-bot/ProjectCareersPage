# Fix for OpenSSL Decoder Error (ERR_OSSL_UNSUPPORTED)

## 🔴 Error You're Seeing:

```
error:1E08010C:DECODER routines::unsupported
ERR_OSSL_UNSUPPORTED
```

This error occurs when OpenSSL cannot decode/parse your private key during JWT token creation.

## ✅ What I Fixed:

I've enhanced the private key processing to handle multiple formats:

1. **Escaped newlines** (`\n`) - Common in environment variables
2. **Single-line keys** - Automatically formats them
3. **Missing newlines** - Adds proper newlines after BEGIN and before END
4. **Extra whitespace** - Cleans up the key
5. **Better validation** - Checks format before attempting to use
6. **Better error messages** - Tells you exactly what's wrong

## 🔧 What to Check in Vercel:

### Option 1: Verify Private Key Format in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click the eye icon next to `GOOGLE_PRIVATE_KEY` to reveal it
3. Verify it looks like this:

```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDI4kjo3Vj3qVAP
C0KDt3vQSzPTuyS1sX9vE3Kn16PTXqSPVatZkKy+0YMy8JsoiYsiCWQHGQmeKyHW
... (more lines)
-----END PRIVATE KEY-----
```

### Option 2: Re-paste the Private Key

If the key looks wrong, try this:

1. **Get the key from your JSON file:**
   - Open your `google-service-account.json` file
   - Copy the entire `private_key` value (including quotes if present)

2. **In Vercel:**
   - Delete the existing `GOOGLE_PRIVATE_KEY` variable
   - Create a new one
   - Paste the key exactly as it appears in the JSON file
   - **Important**: If it has `\n` in the JSON, paste it as-is (Vercel will handle it)

3. **Redeploy** after updating

### Option 3: Use Single-Line Format (If Multi-line Doesn't Work)

If Vercel is having issues with multi-line keys, try:

1. Take your private key
2. Remove all actual newlines
3. Replace them with `\n` (backslash-n)
4. Paste as a single line:

```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDI4kjo3Vj3qVAP\nC0KDt3vQSzPTuyS1sX9vE3Kn16PTXqSPVatZkKy+0YMy8JsoiYsiCWQHGQmeKyHW\n...\n-----END PRIVATE KEY-----\n
```

The code will automatically convert `\n` to actual newlines.

## 🔍 Debug Information:

After deploying the fix, check the logs for:

```
🔍 [DEBUG] Private key processing: {
  originalLength: 1730,
  processedLength: 1730,
  hasActualNewlines: true,
  startsWithCorrect: true,
  endsWithCorrect: true,
  firstLine: "-----BEGIN PRIVATE KEY-----",
  lastLine: "-----END PRIVATE KEY-----"
}
✅ [DEBUG] Private key format validated successfully
✅ [DEBUG] JWT auth object created successfully
```

If you see errors, they'll now be more specific about what's wrong.

## 🚨 Common Issues:

### Issue 1: Key Truncated
**Symptom**: Key is shorter than expected (~1700-2000 chars)
**Fix**: Copy the entire key from JSON file

### Issue 2: Missing BEGIN/END Markers
**Symptom**: Key doesn't start/end correctly
**Fix**: Ensure markers are included exactly as shown

### Issue 3: Wrong Newline Format
**Symptom**: Key has `\n` but OpenSSL can't decode
**Fix**: The code now handles this automatically

### Issue 4: Extra Characters
**Symptom**: Key has extra spaces or characters
**Fix**: The code now trims whitespace automatically

## ✅ After Fixing:

1. **Redeploy** to Vercel
2. **Check logs** for the new debug output
3. **Test the endpoint**: `https://your-app.vercel.app/api/jobs`
4. **Check debug endpoint**: `https://your-app.vercel.app/api/debug/google-sheets`

The enhanced error handling will tell you exactly what's wrong if there are still issues!

## 📝 What Changed in the Code:

1. **Multi-step key processing** - Handles various formats
2. **Automatic formatting** - Fixes common issues
3. **Pre-validation** - Catches errors before JWT creation
4. **Better error messages** - Tells you exactly what to fix
5. **OpenSSL error handling** - Specifically catches decoder errors

The code is now much more robust and should handle your private key correctly!

