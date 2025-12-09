# Mailgun Email Integration

## Overview

The email service has been migrated from Nodemailer to Mailgun for better deliverability and easier configuration.

## Changes Made

### 1. Dependencies
- **Removed**: `nodemailer`, `@types/nodemailer`
- **Added**: `mailgun.js`, `form-data`

### 2. Email Service (`src/services/email.service.ts`)
- Replaced Nodemailer SMTP transport with Mailgun API client
- All email methods now use Mailgun's API
- Development mode still logs to console (no actual emails sent)
- Production mode sends via Mailgun

### 3. Environment Variables

**Old (Nodemailer):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@razmenavrtica.rs
```

**New (Mailgun):**
```env
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain.mailgun.org
MAILGUN_FROM=Razmena Vrtica <postmaster@your-mailgun-domain.mailgun.org>
# MAILGUN_EU=true  # Uncomment for EU domains
```

## Configuration

### Current Setup (Sandbox)
The service is currently configured with Mailgun sandbox credentials:
- Domain: `sandbox07e2d710329547f9834b933773573c95.mailgun.org`
- API Key: Provided in `.env`

**Note**: Sandbox domains can only send to authorized recipients. You need to verify email addresses in Mailgun dashboard.

### Production Setup

1. **Get a Mailgun account**: https://www.mailgun.com/
2. **Add your domain** in Mailgun dashboard
3. **Verify DNS records** (SPF, DKIM, CNAME)
4. **Update `.env` file**:
   ```env
   MAILGUN_API_KEY=your-production-api-key
   MAILGUN_DOMAIN=mg.yourdomain.com
   MAILGUN_FROM=Razmena Vrtica <noreply@yourdomain.com>
   ```

### EU Region
If using an EU Mailgun domain, update the service to use EU endpoint:
```typescript
// In email.service.ts constructor
this.mailgunClient = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: 'https://api.eu.mailgun.net'  // Add this line
});
```

## Testing

### Test Script
Run the test script to verify Mailgun configuration:
```bash
cd backend
npx ts-node test-mailgun.ts
```

### Development Mode
In development (`NODE_ENV=development`), emails are logged to console instead of being sent.

### Production Mode
Set `NODE_ENV=production` in `.env` to enable actual email sending via Mailgun.

## Email Methods

The service provides three email methods:

1. **`sendConfirmationEmail(email, token, fullName)`**
   - Sent after user registration
   - Contains email confirmation link
   - Valid for 24 hours

2. **`sendPasswordResetEmail(email, token, fullName)`**
   - Sent when user requests password reset
   - Contains password reset link
   - Valid for 1 hour

3. **`sendMatchFoundEmail(email, fullName, childName, matchDetails)`**
   - Sent when a kindergarten exchange match is found
   - Contains match details and dashboard link

## Troubleshooting

### Sandbox Limitations
- Can only send to authorized recipients
- Add recipient emails in Mailgun dashboard under "Authorized Recipients"

### Common Issues
1. **"Forbidden"**: Check API key is correct
2. **"Domain not found"**: Verify domain name in `.env`
3. **Emails not received**: Check spam folder, verify recipient is authorized (sandbox)

## Next Steps

1. Verify sandbox emails work with test script
2. Add authorized recipients in Mailgun dashboard
3. For production: Set up custom domain with DNS records
4. Update environment variables for production deployment
