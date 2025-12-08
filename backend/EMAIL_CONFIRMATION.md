# Email Confirmation Feature

## Overview

Email confirmation has been implemented with automatic dev mode bypass. In development, users can register and login immediately without email verification. In production, users must confirm their email before logging in.

## How It Works

### Development Mode (NODE_ENV !== 'production')

- Users are automatically confirmed upon registration
- No confirmation emails are sent
- Confirmation links are logged to console for testing
- Users can login immediately after registration

### Production Mode (NODE_ENV === 'production')

- Users receive a confirmation email after registration
- Email contains a 24-hour valid confirmation link
- Users cannot login until email is confirmed
- Confirmation tokens are securely stored and expire after 24 hours

## Database Changes

New fields added to `user` table:

- `email_confirmed` (boolean, default: false)
- `email_confirmation_token` (varchar, nullable)
- `email_confirmation_token_expires` (timestamp, nullable)

## API Endpoints

### POST /auth/register

Registers a new user. In dev mode, auto-confirms. In production, sends confirmation email.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**

```json
{
  "access_token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

### GET /auth/confirm-email?token={token}

Confirms user's email address.

**Response:**

```json
{
  "message": "Email confirmed successfully"
}
```

### POST /auth/resend-confirmation

Resends confirmation email to user.

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Confirmation email sent"
}
```

### POST /auth/login

Login endpoint. In production, rejects unconfirmed users.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**

```json
{
  "access_token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

**Response (Unconfirmed - Production only):**

```json
{
  "statusCode": 401,
  "message": "Please confirm your email before logging in"
}
```

## Environment Variables

Add to `backend/.env`:

```bash
# Environment
NODE_ENV=development  # Set to 'production' to enable email confirmation

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Email Configuration (Production only)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@razmenavrtica.rs
```

## Frontend

### Confirmation Page

Created at `/confirm-email` - handles email confirmation when users click the link.

### API Functions

- `confirmEmailApi(token)` - Confirms email
- `resendConfirmationApi(email)` - Resends confirmation email

## Testing in Development

1. Register a new user - they're auto-confirmed
2. Check console logs to see the confirmation URL that would be sent
3. Visit the URL to test the confirmation flow
4. User can login immediately without confirmation

## Production Setup

1. Set `NODE_ENV=production`
2. Configure SMTP settings in `.env`
3. Test email delivery with a real email account
4. Users will receive confirmation emails and must confirm before login

## Email Service

The `EmailService` handles:

- Sending confirmation emails (production)
- Logging emails to console (development)
- Password reset emails (future feature)
- Configurable SMTP settings

## Security Features

- Tokens are cryptographically random (32 bytes)
- Tokens expire after 24 hours
- Tokens are cleared after successful confirmation
- Unconfirmed users cannot login in production
- Dev mode bypass for easy development
