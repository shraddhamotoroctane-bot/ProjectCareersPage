# Render Deployment Guide

Use this guide to take the project live on [Render](https://render.com).

---

## 1. Prerequisites

1. **Google Service Account**
   - Has access to your Google Sheet (Editor permissions)
   - You have the `client_email`, `private_key`, and the spreadsheet ID

2. **Repository Access**
   - The repo is hosted on GitHub (Render imports from GitHub)

3. **Render Account**
   - Free plan is enough for testing (see `render.yaml`)

---

## 2. Environment Variables (Required)

| Key                         | Description                                      |
|-----------------------------|--------------------------------------------------|
| `GOOGLE_SHEET_ID`           | ID from your Google Sheets URL (`/d/<ID>/edit`)  |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` from the service account JSON |
| `GOOGLE_PRIVATE_KEY`        | `private_key` from the service account JSON      |
| `FILE_STORAGE_DRIVER`       | `google` (recommended) or `local`                |

> **Important – `GOOGLE_PRIVATE_KEY` formatting on Render**
>
> Render accepts multi‑line values, but it is safer to paste the key as **one line** with escaped newlines (`\n`).  
> Example (all on a single line):
> ```
> -----BEGIN PRIVATE KEY-----\nMIIE...snipped...\n-----END PRIVATE KEY-----\n
> ```
> This avoids the OpenSSL decoder error (`ERR_OSSL_UNSUPPORTED`).

Render automatically provides `PORT`, so you do **not** need to set it.
If you set `FILE_STORAGE_DRIVER=google`, resumes are uploaded to Google Drive and links in Google Sheets will always download successfully.

---

## 3. Deploy Using `render.yaml`

The repository already includes `render.yaml`. Render will read this file and configure the service.

1. **Create New Web Service**
   - In Render dashboard: **New → Web Service**
   - Connect your GitHub repo
   - Render will detect `render.yaml`

2. **Confirm Settings**
   - Environment: `Node`
   - Build Command:
     ```
     npm ci && npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
     ```
   - Start Command:
     ```
     npm start
     ```
   - Plan: `Free` (as defined in `render.yaml`)

3. **Add Environment Variables**
   - In the Render dashboard, add the three required variables (see section 2)
   - Remember the `GOOGLE_PRIVATE_KEY` formatting tip

4. **Deploy**
   - Click **Create Web Service**
   - Render will build the project (takes a few minutes on first deploy)

---

## 4. Post-Deployment Checklist

1. **Health Check**
   - Visit `/api/health` on your Render URL to ensure the server responds

2. **Debug Endpoint**
   - Visit `/api/debug/google-sheets`
   - Confirm:
     - `allEnvVarsPresent: true`
     - `connectionWorking: true`
     - `storage.type === "GoogleSheetsStorage"`

3. **Front-End Verification**
   - Open the Render URL root (`https://<your-app>.onrender.com`)
   - Confirm the jobs list loads

4. **Logs**
   - Render dashboard → Logs
   - Look for `[DEBUG]` entries for additional diagnostics if something fails

---

## 5. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `500` when fetching `/api/jobs` with OpenSSL errors | Private key format incorrect | Re-enter key as single line with `\n` |
| `PERMISSION_DENIED` in logs | Service account not shared on sheet | Share Google Sheet with service account (Editor) |
| `NOT_FOUND` in logs | Wrong `GOOGLE_SHEET_ID` | Copy ID again from Sheets URL |
| `Using MemoryStorage` in logs | Env vars missing | Ensure all three env vars are set in Render |

---

## 6. Redeploying

Whenever you push to `main`, Render will redeploy automatically if auto-deploy is enabled.  
To redeploy manually:
1. Render dashboard → Web Service
2. Click **Manual Deploy → Deploy latest commit**

---

Render deployment is now ready. Once the environment variables are configured correctly, the site should go live without code changes. Let the team know the Render URL once everything checks out! 🚀


