# Google OAuth Troubleshooting Guide

## Issue: Redirects to `/login?error=no_code`

This means the OAuth callback isn't receiving the authorization code from Google. Follow these steps to fix it.

---

## Step 1: Check Supabase OAuth Configuration

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Click on **Google**
3. Make sure it's **enabled**
4. Copy the **Callback URL** shown (should look like):
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```

---

## Step 2: Configure Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Select your project (or create one)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Select **Web application**
6. Add **Authorized redirect URIs**:
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```
   > ⚠️ Make sure this EXACTLY matches the Supabase callback URL!

7. Copy the **Client ID** and **Client Secret**

---

## Step 3: Add Credentials to Supabase

1. Go back to **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. Paste:
   - **Client ID**: From Google Console
   - **Client Secret**: From Google Console
3. Click **Save**

---

## Step 4: Check Site URL in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   ```
   http://localhost:3000
   ```
   (or your production URL)

3. Add to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

---

## Step 5: Verify Google OAuth Consent Screen

1. Go to **Google Cloud Console** → **APIs & Services** → **OAuth consent screen**
2. Make sure the app is **published** or in **Testing mode** with your email added
3. If in testing mode, add your email as a test user

---

## Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `no_code` | Callback URL mismatch | Verify URLs match exactly |
| `access_denied` | User not in test users | Add email to OAuth consent screen |
| `redirect_uri_mismatch` | Wrong redirect URI in Google | Update Authorized redirect URIs |
| `invalid_client` | Wrong Client ID/Secret | Re-copy from Google Console |

---

## Test OAuth Flow

After configuration:

1. Clear browser cookies
2. Go to http://localhost:3000/signup
3. Click "Sign up with Google"
4. Complete Google authentication
5. Should redirect to `/onboarding`

---

## Debug: Check Browser Console

If still failing:
1. Open browser DevTools → Network tab
2. Click "Sign up with Google"
3. Look at the redirect chain
4. Check what URL Google is redirecting to

The final redirect should contain `?code=...` for successful auth.
