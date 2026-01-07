/**
 * Email Service Test Script
 * 
 * This script tests the SMTP email functionality.
 * Make sure your .env file has the following variables set:
 * - EMAIL_PROVIDER=smtp
 * - SMTP_USER=your-email@gmail.com
 * - SMTP_PASS=your-app-password
 * - NODE_ENV=production (to actually send emails)
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

console.log(`\n${colors.cyan}========================================`);
console.log(`📧 SMTP Email Service Test`);
console.log(`========================================${colors.reset}\n`);

// Check environment variables
console.log(`${colors.blue}📋 Configuration:${colors.reset}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER || 'smtp'}`);
console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '587'}`);
console.log(`   SMTP_SECURE: ${process.env.SMTP_SECURE || 'false'}`);
console.log(`   SMTP_USER: ${process.env.SMTP_USER ? '✅ Set' : '❌ Not set'}`);
console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Set (length: ' + process.env.SMTP_PASS.length + ')' : '❌ Not set'}`);
console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not set (will use default)'}\n`);

// Validate required variables
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`${colors.red}❌ Error: SMTP_USER and SMTP_PASS must be set in .env file${colors.reset}\n`);
    process.exit(1);
}

// Get test email address (defaults to SMTP_USER)
const testEmail = process.env.TEST_EMAIL || process.env.SMTP_USER;
console.log(`${colors.yellow}📮 Test email will be sent to: ${testEmail}${colors.reset}\n`);

// Create transporter
console.log(`${colors.blue}🔧 Creating SMTP transporter...${colors.reset}`);
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Test email content
const emailOptions = {
    from: process.env.EMAIL_FROM || `Razmena Vrtica <${process.env.SMTP_USER}>`,
    to: testEmail,
    subject: 'Test Email - Razmena Vrtica SMTP',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">✅ SMTP Email Test Successful!</h2>
      <p>This is a test email from the Razmena Vrtica application.</p>
      
      <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Test Details:</h3>
        <ul style="list-style: none; padding-left: 0;">
          <li>📧 <strong>Provider:</strong> SMTP (Nodemailer)</li>
          <li>🖥️  <strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'smtp.gmail.com'}</li>
          <li>🔌 <strong>Port:</strong> ${process.env.SMTP_PORT || '587'}</li>
          <li>👤 <strong>User:</strong> ${process.env.SMTP_USER}</li>
          <li>⏰ <strong>Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
      </div>

      <p style="color: #059669; font-weight: bold;">
        🎉 If you're reading this, your SMTP email configuration is working correctly!
      </p>

      <hr style="border: 1px solid #E5E7EB; margin: 30px 0;">
      
      <p style="color: #6B7280; font-size: 14px;">
        This is an automated test email from the Razmena Vrtica backend service.
        You can safely delete this email.
      </p>
    </div>
  `,
    text: `
✅ SMTP Email Test Successful!

This is a test email from the Razmena Vrtica application.

Test Details:
- Provider: SMTP (Nodemailer)
- SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}
- Port: ${process.env.SMTP_PORT || '587'}
- User: ${process.env.SMTP_USER}
- Time: ${new Date().toLocaleString()}

🎉 If you're reading this, your SMTP email configuration is working correctly!

---
This is an automated test email from the Razmena Vrtica backend service.
You can safely delete this email.
  `,
};

// Send test email
async function sendTestEmail() {
    try {
        console.log(`${colors.cyan}📤 Sending test email...${colors.reset}\n`);

        const info = await transporter.sendMail(emailOptions);

        console.log(`${colors.green}========================================`);
        console.log(`✅ SUCCESS! Email sent successfully!`);
        console.log(`========================================${colors.reset}\n`);

        console.log(`${colors.blue}📊 Email Details:${colors.reset}`);
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
        console.log(`   To: ${testEmail}\n`);

        console.log(`${colors.green}✨ Check your inbox at: ${testEmail}${colors.reset}`);
        console.log(`${colors.yellow}💡 Note: If you don't see it, check your spam folder${colors.reset}\n`);

    } catch (error) {
        console.log(`${colors.red}========================================`);
        console.log(`❌ ERROR: Failed to send email`);
        console.log(`========================================${colors.reset}\n`);

        console.log(`${colors.red}Error Details:${colors.reset}`);
        console.log(`   Message: ${error.message}`);
        if (error.code) console.log(`   Code: ${error.code}`);
        if (error.command) console.log(`   Command: ${error.command}`);
        console.log();

        // Common error solutions
        console.log(`${colors.yellow}🔍 Common Solutions:${colors.reset}`);
        if (error.message.includes('Invalid login')) {
            console.log(`   1. Make sure you're using a Gmail App Password, not your regular password`);
            console.log(`   2. Generate one at: https://myaccount.google.com/apppasswords`);
            console.log(`   3. Enable 2-Step Verification if not already enabled`);
        } else if (error.message.includes('ECONNECTION') || error.message.includes('timeout')) {
            console.log(`   1. Check your internet connection`);
            console.log(`   2. Verify SMTP_HOST and SMTP_PORT are correct`);
            console.log(`   3. Check if your firewall is blocking the connection`);
        } else if (error.message.includes('EAUTH')) {
            console.log(`   1. Verify SMTP_USER and SMTP_PASS are correct`);
            console.log(`   2. Check if the App Password has expired`);
            console.log(`   3. Make sure there are no extra spaces in your credentials`);
        } else {
            console.log(`   1. Double-check all SMTP environment variables`);
            console.log(`   2. Review the error message above`);
            console.log(`   3. See EMAIL_CONFIGURATION.md for detailed setup`);
        }
        console.log();

        process.exit(1);
    }
}

// Verify connection first
console.log(`${colors.cyan}🔍 Verifying SMTP connection...${colors.reset}`);
transporter.verify(function (error, success) {
    if (error) {
        console.log(`${colors.red}❌ Connection verification failed:${colors.reset}`);
        console.log(`   ${error.message}\n`);
        process.exit(1);
    } else {
        console.log(`${colors.green}✅ SMTP connection verified successfully!${colors.reset}\n`);
        sendTestEmail();
    }
});
