import { Injectable } from '@nestjs/common';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

@Injectable()
export class EmailService {
  private mailgunClient: any;
  private isDevelopment: boolean;
  private mailgunDomain: string;
  private fromEmail: string;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.mailgunDomain = process.env.MAILGUN_DOMAIN!;
    this.fromEmail =
      process.env.MAILGUN_FROM ||
      `Razmena Vrtica <postmaster@${this.mailgunDomain}>`;

    if (!this.isDevelopment) {
      // Initialize Mailgun client for production
      const mailgun = new Mailgun(FormData);
      this.mailgunClient = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY!,
        // Uncomment if using EU domain:
        // url: 'https://api.eu.mailgun.net'
      });
    } else {
      this.mailgunClient = null;
    }
  }

  async sendConfirmationEmail(
    email: string,
    token: string,
    fullName: string,
  ): Promise<void> {
    const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirm-email?token=${token}`;

    const subject = 'Potvrdite vašu email adresu - Razmena Vrtica';
    const html = `
      <h2>Dobrodošli, ${fullName}!</h2>
      <p>Hvala što ste se registrovali na Razmena Vrtica platformu.</p>
      <p>Molimo vas da potvrdite vašu email adresu klikom na link ispod:</p>
      <p><a href="${confirmUrl}">Potvrdite email</a></p>
      <p>Ili kopirajte sledeći link u vaš pretraživač:</p>
      <p>${confirmUrl}</p>
      <p>Link je validan 24 sata.</p>
      <br>
      <p>Ako niste vi kreirali ovaj nalog, možete ignorisati ovaj email.</p>
    `;
    const text = `
      Dobrodošli, ${fullName}!
      
      Hvala što ste se registrovali na Razmena Vrtica platformu.
      
      Molimo vas da potvrdite vašu email adresu klikom na sledeći link:
      ${confirmUrl}
      
      Link je validan 24 sata.
      
      Ako niste vi kreirali ovaj nalog, možete ignorisati ovaj email.
    `;

    if (this.isDevelopment) {
      // In dev mode, log to console instead of sending
      console.log('\n=== DEV MODE: Email Confirmation ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Confirmation URL: ${confirmUrl}`);
      console.log('====================================\n');
    } else {
      await this.sendEmail(email, subject, html, text);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    fullName: string,
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const subject = 'Resetovanje lozinke - Razmena Vrtica';
    const html = `
      <h2>Zdravo, ${fullName}!</h2>
      <p>Primili smo zahtev za resetovanje vaše lozinke.</p>
      <p>Kliknite na link ispod da resetujete lozinku:</p>
      <p><a href="${resetUrl}">Resetuj lozinku</a></p>
      <p>Ili kopirajte sledeći link u vaš pretraživač:</p>
      <p>${resetUrl}</p>
      <p>Link je validan 1 sat.</p>
      <br>
      <p>Ako niste vi zatražili resetovanje lozinke, možete ignorisati ovaj email.</p>
    `;
    const text = `
      Zdravo, ${fullName}!
      
      Primili smo zahtev za resetovanje vaše lozinke.
      
      Kliknite na sledeći link da resetujete lozinku:
      ${resetUrl}
      
      Link je validan 1 sat.
      
      Ako niste vi zatražili resetovanje lozinke, možete ignorisati ovaj email.
    `;

    if (this.isDevelopment) {
      console.log('\n=== DEV MODE: Password Reset ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('================================\n');
    } else {
      await this.sendEmail(email, subject, html, text);
    }
  }

  async sendMatchFoundEmail(
    email: string,
    fullName: string,
    childName: string,
    matchDetails: {
      matchId: string;
      participantCount: number;
      targetKindergartenName: string;
    },
  ): Promise<void> {
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;

    const subject = 'Pronađena razmena za vaše dete - Razmena Vrtica';
    const html = `
      <h2>Zdravo, ${fullName}!</h2>
      <p>Odlične vesti! Pronašli smo potencijalnu razmenu za <strong>${childName}</strong>.</p>
      <h3>Detalji razmene:</h3>
      <ul>
        <li><strong>Broj učesnika:</strong> ${matchDetails.participantCount} ${matchDetails.participantCount === 2 ? 'dece' : matchDetails.participantCount === 3 ? 'dece' : 'dece'}</li>
        <li><strong>Ciljna vrtić:</strong> ${matchDetails.targetKindergartenName}</li>
      </ul>
      <p>Prijavite se na platformu da vidite sve detalje razmene i kontaktirate druge roditelje:</p>
      <p><a href="${dashboardUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Pogledaj razmenu</a></p>
      <p>Ili kopirajte sledeći link u vaš pretraživač:</p>
      <p>${dashboardUrl}</p>
      <br>
      <p>Razmena je automatski kreirana na osnovu vaših željenih vrtića. Možete je pregledati, kontaktirati druge roditelje i dogovoriti detalje.</p>
      <p><em>Napomena: Razmena ostaje aktivna dok svi učesnici ne potvrde ili dok neko ne otkaže.</em></p>
    `;
    const text = `
      Zdravo, ${fullName}!
      
      Odlične vesti! Pronašli smo potencijalnu razmenu za ${childName}.
      
      Detalji razmene:
      - Broj učesnika: ${matchDetails.participantCount} dece
      - Ciljna vrtić: ${matchDetails.targetKindergartenName}
      
      Prijavite se na platformu da vidite sve detalje razmene i kontaktirate druge roditelje:
      ${dashboardUrl}
      
      Razmena je automatski kreirana na osnovu vaših željenih vrtića. Možete je pregledati, kontaktirati druge roditelje i dogovoriti detalje.
      
      Napomena: Razmena ostaje aktivna dok svi učesnici ne potvrde ili dok neko ne otkaže.
    `;

    if (this.isDevelopment) {
      console.log('\n=== DEV MODE: Match Found Notification ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Child: ${childName}`);
      console.log(`Match ID: ${matchDetails.matchId}`);
      console.log(`Participants: ${matchDetails.participantCount}`);
      console.log(
        `Target Kindergarten: ${matchDetails.targetKindergartenName}`,
      );
      console.log(`Dashboard URL: ${dashboardUrl}`);
      console.log('==========================================\n');
    } else {
      await this.sendEmail(email, subject, html, text);
    }
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<void> {
    if (!this.mailgunClient) {
      throw new Error('Mailgun client not initialized');
    }

    try {
      const data = await this.mailgunClient.messages.create(
        this.mailgunDomain,
        {
          from: this.fromEmail,
          to: [to],
          subject,
          html,
          text,
        },
      );
      console.log('Email sent successfully:', data);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}
