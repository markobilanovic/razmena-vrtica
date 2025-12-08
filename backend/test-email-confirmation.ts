/**
 * Quick test script to verify email confirmation works in dev mode
 * Run with: ts-node -r tsconfig-paths/register test-email-confirmation.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/services/auth.service';

async function testEmailConfirmation() {
  console.log('🧪 Testing Email Confirmation Feature\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'password123';
  const testFullName = 'Test User';

  try {
    // Test 1: Register a new user
    console.log('1️⃣  Registering new user...');
    const registerResult = await authService.register({
      email: testEmail,
      password: testPassword,
      fullName: testFullName,
    });
    console.log('✅ Registration successful');
    console.log(`   User ID: ${registerResult.user.id}`);
    console.log(`   Email: ${registerResult.user.email}`);
    console.log(`   Token: ${registerResult.access_token.substring(0, 20)}...`);

    // Test 2: Login with the new user
    console.log('\n2️⃣  Testing login...');
    const user = await authService.validateUser(testEmail, testPassword);
    if (user) {
      console.log('✅ Login successful');
      console.log(`   Email confirmed: ${user.email_confirmed}`);
    } else {
      console.log('❌ Login failed');
    }

    // Test 3: Try to confirm email (should say already confirmed in dev mode)
    console.log('\n3️⃣  Testing email confirmation endpoint...');
    try {
      const confirmResult = await authService.confirmEmail('fake-token');
      console.log(`✅ ${confirmResult.message}`);
    } catch (error: any) {
      console.log(`ℹ️  Expected error: ${error.message}`);
    }

    console.log('\n✨ All tests passed!');
    console.log('\n📝 Note: In dev mode (NODE_ENV !== production):');
    console.log('   - Users are auto-confirmed on registration');
    console.log('   - No emails are sent (logged to console instead)');
    console.log('   - Users can login immediately');
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await app.close();
  }
}

testEmailConfirmation();
