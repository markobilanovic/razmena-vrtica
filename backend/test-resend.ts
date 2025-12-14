import { Resend } from 'resend';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testResend() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.error('❌ RESEND_API_KEY is missing in environment variables');
        process.exit(1);
    }

    const resend = new Resend(apiKey);

    const fromEmail = process.env.EMAIL_FROM || 'Razmena Vrtica <onboarding@resend.dev>';
    // Suggest using the delivered@resend.dev for testing if no verified domain is available, 
    // but let's assume the user might want a real test.
    // Resend free tier only sends to the account email.
    const testEmail = 'bilanovic90@gmail.com';
    const testName = 'Marko Bilanovic';

    console.log('🚀 Testing Resend configuration...');
    console.log('From:', fromEmail);
    console.log('To:', testEmail);
    console.log('API Key present:', !!apiKey);
    console.log('');

    // Test 1: Simple test email
    console.log('📧 Test 1: Sending simple test email...');
    try {
        const data1 = await resend.emails.send({
            from: fromEmail,
            to: testEmail,
            subject: 'Test Email - Razmena Vrtica (Resend)',
            text: 'This is a test email from Razmena Vrtica platform using Resend!',
            html: '<h2>Test Email</h2><p>This is a test email from <strong>Razmena Vrtica</strong> platform using Resend!</p>',
        });

        if (data1.error) {
            console.error('❌ Failed to send simple test email:', data1.error);
        } else {
            console.log('✅ Simple test email sent!');
            console.log('Response:', data1);
        }
        console.log('');
    } catch (error) {
        console.error('❌ Failed to send simple test email:', error);
        console.log('');
    }

    // Test 2: Confirmation email (like the real one)
    console.log('📧 Test 2: Sending confirmation email...');
    const confirmUrl = 'http://localhost:3000/confirm-email?token=test-token-123';
    try {
        const data2 = await resend.emails.send({
            from: fromEmail,
            to: testEmail,
            subject: 'Potvrdite vašu email adresu - Razmena Vrtica',
            html: `
        <h2>Dobrodošli, ${testName}!</h2>
        <p>Hvala što ste se registrovali na Razmena Vrtica platformu.</p>
        <p>Molimo vas da potvrdite vašu email adresu klikom na link ispod:</p>
        <p><a href="${confirmUrl}">Potvrdite email</a></p>
        <p>Ili kopirajte sledeći link u vaš pretraživač:</p>
        <p>${confirmUrl}</p>
        <p>Link je validan 24 sata.</p>
        <br>
        <p>Ako niste vi kreirali ovaj nalog, možete ignorisati ovaj email.</p>
      `,
            text: `
        Dobrodošli, ${testName}!
        
        Hvala što ste se registrovali na Razmena Vrtica platformu.
        
        Molimo vas da potvrdite vašu email adresu klikom na sledeći link:
        ${confirmUrl}
        
        Link je validan 24 sata.
        
        Ako niste vi kreirali ovaj nalog, možete ignorisati ovaj email.
      `,
        });

        if (data2.error) {
            console.error('❌ Failed to send confirmation email:', data2.error);
        } else {
            console.log('✅ Confirmation email sent!');
            console.log('Response:', data2);
        }
        console.log('');
    } catch (error) {
        console.error('❌ Failed to send confirmation email:', error);
        console.log('');
    }

    // Test 3: Match found email
    console.log('📧 Test 3: Sending match found email...');
    const dashboardUrl = 'http://localhost:3000/dashboard';
    try {
        const data3 = await resend.emails.send({
            from: fromEmail,
            to: testEmail,
            subject: 'Pronađena razmena za vaše dete - Razmena Vrtica',
            html: `
        <h2>Zdravo, ${testName}!</h2>
        <p>Odlične vesti! Pronašli smo potencijalnu razmenu za <strong>Ana</strong>.</p>
        <h3>Detalji razmene:</h3>
        <ul>
          <li><strong>Broj učesnika:</strong> 3 dece</li>
          <li><strong>Ciljna vrtić:</strong> Vrtić Bambi</li>
        </ul>
        <p>Prijavite se na platformu da vidite sve detalje razmene i kontaktirate druge roditelje:</p>
        <p><a href="${dashboardUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Pogledaj razmenu</a></p>
        <p>Ili kopirajte sledeći link u vaš pretraživač:</p>
        <p>${dashboardUrl}</p>
        <br>
        <p>Razmena je automatski kreirana na osnovu vaših željenih vrtića. Možete je pregledati, kontaktirati druge roditelje i dogovoriti detalje.</p>
        <p><em>Napomena: Razmena ostaje aktivna dok svi učesnici ne potvrde ili dok neko ne otkaže.</em></p>
      `,
            text: `
        Zdravo, ${testName}!
        
        Odlične vesti! Pronašli smo potencijalnu razmenu za Ana.
        
        Detalji razmene:
        - Broj učesnika: 3 dece
        - Ciljna vrtić: Vrtić Bambi
        
        Prijavite se na platformu da vidite sve detalje razmene i kontaktirate druge roditelje:
        ${dashboardUrl}
        
        Razmena je automatski kreirana na osnovu vaših željenih vrtića. Možete je pregledati, kontaktirati druge roditelje i dogovoriti detalje.
        
        Napomena: Razmena ostaje aktivna dok svi učesnici ne potvrde ili dok neko ne otkaže.
      `,
        });

        if (data3.error) {
            console.error('❌ Failed to send match found email:', data3.error);
        } else {
            console.log('✅ Match found email sent!');
            console.log('Response:', data3);
        }
        console.log('');
    } catch (error) {
        console.error('❌ Failed to send match found email:', error);
        console.log('');
    }

    console.log('🎉 Email test completed!');
    console.log(`📬 Check your inbox at: ${testEmail}`);
}

testResend();
