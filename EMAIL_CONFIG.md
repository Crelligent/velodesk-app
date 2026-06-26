# Velodesk Email Configuration Guide

## Issue: Email Sender Shows "noreply@mail.app.supabase.io"

By default, Supabase sends auth emails from their domain. To use your own domain (e.g., `noreply@velodesk.io`), you need to configure a custom SMTP provider.

## Option 1: Use Resend (Recommended)

You already have Resend integrated for transactional emails. Here's how to use it for auth emails:

### Step 1: Get Resend SMTP Credentials

1. Go to https://resend.com/domains
2. Add and verify your domain `velodesk.io`
3. Go to https://resend.com/api-keys
4. Create an API key with "Sending access"

### Step 2: Configure Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **SMTP Settings**
2. Toggle **"Enable Custom SMTP"** ON
3. Fill in:

| Field | Value |
|-------|-------|
| Host | `smtp.resend.com` |
| Port | `465` |
| User | `resend` |
| Password | `re_YOUR_API_KEY` (your Resend API key) |
| Sender name | `Velodesk` |
| Sender email | `noreply@velodesk.io` |

4. Click **Save**

## Option 2: Use SendGrid

1. Create a SendGrid account
2. Verify your domain
3. Get SMTP credentials from Settings → API Keys
4. Configure in Supabase:

| Field | Value |
|-------|-------|
| Host | `smtp.sendgrid.net` |
| Port | `465` |
| User | `apikey` |
| Password | `SG.YOUR_API_KEY` |
| Sender email | `noreply@velodesk.io` |

## Option 3: Use Mailgun

1. Create a Mailgun account
2. Verify your domain
3. Get SMTP credentials from Sending → Domain settings → SMTP credentials
4. Configure in Supabase with your Mailgun SMTP details

## Verify Configuration

After setting up SMTP:

1. Go to **Authentication** → **Email Templates**
2. Customize templates if desired
3. Test by signing up with a new email

## Additional: Custom Email Templates

Once SMTP is configured, you can customize email templates:

1. Go to **Authentication** → **Email Templates**
2. Edit:
   - Confirm signup
   - Magic link
   - Change email
   - Reset password
   - Invite user

### Example Custom Confirmation Template:

```html
<h2>Welcome to Velodesk!</h2>
<p>Click the link below to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>This link expires in 24 hours.</p>
<br>
<p>— The Velodesk Team</p>
```

## Domain Verification

For best deliverability:

1. Add SPF record to your DNS
2. Add DKIM record (provided by your email service)
3. Add DMARC record

Example DNS records for Resend:
```
TXT  @       v=spf1 include:resend.com ~all
TXT  resend  [provided by Resend]
TXT  _dmarc  v=DMARC1; p=none; rua=mailto:dmarc@velodesk.io
```
