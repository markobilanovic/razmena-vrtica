# Email Service Configuration Guide

The application supports **two email providers** that you can easily switch between:
1. **SMTP** (via Nodemailer) - Use Gmail or any SMTP service
2. **Resend** - Modern transactional email API

## Quick Switch

Change the `EMAIL_PROVIDER` environment variable:

```bash
# Use Gmail/SMTP (default)
EMAIL_PROVIDER=smtp

# Use Resend
EMAIL_PROVIDER=resend
```

---

## Option 1: SMTP (Gmail) Configuration

### Prerequisites
- A Gmail account
- Gmail App Password (required for 2FA accounts)

### Step 1: Generate Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll to **App passwords** at the bottom
4. Generate a new app password for "Mail"
5. **Important**: Save this password - you won't see it again!

### Step 2: Configure Environment Variables

Add these to your `.env` or `.env.production` file:

```bash
# Email Provider Selection
EMAIL_PROVIDER=smtp

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password

# From Address (optional)
EMAIL_FROM=Razmena Vrtica <your-email@gmail.com>
```

### SMTP Settings Explained

- **SMTP_HOST**: Gmail uses `smtp.gmail.com` (change for other providers)
- **SMTP_PORT**: 
  - `587` - TLS (recommended)
  - `465` - SSL (set SMTP_SECURE=true)
  - `25` - Plain (not recommended)
- **SMTP_SECURE**: `false` for port 587, `true` for port 465
- **SMTP_USER**: Your full Gmail address
- **SMTP_PASS**: The 16-character app password from Step 1

---

## Option 2: Resend Configuration

### Prerequisites
- A Resend account ([resend.com](https://resend.com))
- A verified domain (required for production)

### Step 1: Get API Key

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your domain
3. Go to **API Keys** → Create new API key
4. Copy the API key (starts with `re_`)

### Step 2: Configure Environment Variables

```bash
# Email Provider Selection
EMAIL_PROVIDER=resend

# Resend Configuration
RESEND_API_KEY=re_your_actual_api_key_here

# From Address (must use your verified domain)
EMAIL_FROM=Razmena Vrtica <noreply@your-verified-domain.com>
```

### Important Notes for Resend

- ⚠️ **You MUST have a verified domain** to send emails in production
- The free tier includes 3,000 emails/month
- Default test domain `onboarding@resend.dev` has limitations

---

## Development Mode

In development (`NODE_ENV=development`), emails are **not actually sent**. Instead, they're logged to the console with all details including:
- Recipient email
- Subject
- Confirmation/Reset URLs
- Match details

This works regardless of which provider is configured.

---

## Testing Your Configuration

### For SMTP (Gmail):

```typescript
// The service will log:
// ✅ Email sent successfully via SMTP: <message-id>
```

### For Resend:

```typescript
// The service will log:
// ✅ Email sent successfully via Resend: { id: '...', ... }
```

### Common Errors:

**SMTP Error: "Invalid login"**
- Check that you're using an App Password, not your regular Gmail password
- Verify SMTP_USER is correct
- Ensure 2-Step Verification is enabled

**Resend Error: "Domain not verified"**
- You need to verify your domain in Resend dashboard
- For testing, use `onboarding@resend.dev` but it has strict limitations

---

## Which Provider Should I Use?

### Use SMTP (Gmail) when:
- ✅ You don't have a custom domain
- ✅ You're just getting started
- ✅ You need a quick, free solution
- ✅ Sending moderate volume (<500/day within Gmail limits)

### Use Resend when:
- ✅ You have a verified custom domain
- ✅ You need better deliverability
- ✅ You want detailed analytics
- ✅ You're in production
- ✅ Sending higher volumes

---

## Environment Variables Reference

| Variable | Required For | Default | Description |
|----------|-------------|---------|-------------|
| `EMAIL_PROVIDER` | Both | `smtp` | Choose `smtp` or `resend` |
| `SMTP_HOST` | SMTP | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | SMTP | `587` | SMTP server port |
| `SMTP_SECURE` | SMTP | `false` | Use SSL/TLS |
| `SMTP_USER` | SMTP | - | SMTP auth username (your email) |
| `SMTP_PASS` | SMTP | - | SMTP auth password (app password) |
| `RESEND_API_KEY` | Resend | - | Your Resend API key |
| `EMAIL_FROM` | Both | Provider-specific | Sender email address |

---

## Troubleshooting

### Emails not sending in production

1. Check the logs for error messages
2. Verify `NODE_ENV=production` is set
3. Confirm all required environment variables are set
4. Test SMTP credentials separately

### Gmail blocking sign-in attempts

- Use an App Password, not your regular password
- Enable "Less secure app access" (not recommended)
- Check Gmail security alerts

### Resend emails going to spam

- Ensure your domain's DNS records are properly configured
- Add SPF, DKIM, and DMARC records
- Verify domain in Resend dashboard

---

## Example: Switching Providers

If you're currently using Resend but want to switch to Gmail SMTP:

1. Generate a Gmail App Password
2. Update your `.env.production`:
   ```bash
   EMAIL_PROVIDER=smtp
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   # Comment out or remove RESEND_API_KEY
   ```
3. Restart your backend server
4. Check logs for: `📧 Email service initialized with provider: smtp`

That's it! No code changes needed.
