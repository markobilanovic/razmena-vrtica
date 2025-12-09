import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { EmailService } from './src/services/email.service';

async function testEmailService() {
  console.log('🚀 Starting email service test...\n');

  // Create NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);
  const emailService = app.get(EmailService);

  const testEmail = 'bilanovic90@gmail.com';
  const testName = 'Marko Bilanovic';

  try {
    // Test 1: Confirmation Email
    console.log('📧 Test 1: Sending confirmation email...');
    await emailService.sendConfirmationEmail(
      testEmail,
      'test-token-123456',
      testName,
    );
    console.log('✅ Confirmation email sent successfully!\n');

    // Test 2: Password Reset Email
    // console.log('📧 Test 2: Sending password reset email...');
    // await emailService.sendPasswordResetEmail(
    //   testEmail,
    //   'reset-token-789012',
    //   testName,
    // );
    // console.log('✅ Password reset email sent successfully!\n');
    //
    // // Test 3: Match Found Email
    // console.log('📧 Test 3: Sending match found email...');
    // await emailService.sendMatchFoundEmail(testEmail, testName, 'Ana', {
    //   matchId: 'test-match-id',
    //   participantCount: 3,
    //   targetKindergartenName: 'Vrtić Bambi',
    // });
    // console.log('✅ Match found email sent successfully!\n');

    console.log('🎉 All emails sent successfully!');
    console.log(`\n📬 Check inbox at: ${testEmail}`);
  } catch (error) {
    console.error('❌ Error sending emails:', error);
  } finally {
    await app.close();
  }
}

testEmailService();
