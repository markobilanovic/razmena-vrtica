# Email Service - Dual Provider Implementation

## ✅ What's Been Done

Your email service now supports **both SMTP (Gmail) and Resend** with easy switching!

### Changes Made:

1. **Updated `email.service.ts`**
   - Added support for both Nodemailer (SMTP) and Resend
   - Automatic provider selection via `EMAIL_PROVIDER` env variable
   - Defaults to SMTP for backward compatibility
   - Shared email templates across both providers

2. **Installed Dependencies**
   - `nodemailer` - SMTP email sending
   - `@types/nodemailer` - TypeScript types

3. **Updated Configuration Files**
   - `.env.production.example` - Added SMTP configuration options
   - Created `EMAIL_CONFIGURATION.md` - Complete setup guide

## 🚀 Quick Start

### Use Gmail SMTP (Recommended for now):

```bash
# In your .env or .env.production file:
EMAIL_PROVIDER=smtp
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

### Use Resend (when you have a domain):

```bash
# In your .env or .env.production file:
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
```

## 📋 Next Steps

1. **Generate a Gmail App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Create a new app password
   - Add to your `.env.production` file

2. **Update Your Production Environment**:
   ```bash
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   EMAIL_FROM=Razmena Vrtica <your-email@gmail.com>
   ```

3. **Deploy and Test**:
   - The service will log which provider it's using on startup
   - Look for: `📧 Email service initialized with provider: smtp`

## 📚 Documentation

See `EMAIL_CONFIGURATION.md` for:
- Complete setup instructions for both providers
- Troubleshooting guide
- Gmail App Password generation steps
- Resend domain verification steps
- Environment variables reference

## 🔄 Switching Providers

To switch from Resend to SMTP (or vice versa):
1. Change `EMAIL_PROVIDER=smtp` (or `resend`)
2. Ensure the corresponding env vars are set
3. Restart the backend
4. Done! No code changes needed.

## ✨ Features

- ✅ Support for both SMTP and Resend
- ✅ Easy switching via environment variable
- ✅ Development mode (logs to console)
- ✅ Production mode (sends actual emails)
- ✅ Shared email templates
- ✅ Proper error handling
- ✅ TypeScript support
- ✅ Startup logs showing active provider
