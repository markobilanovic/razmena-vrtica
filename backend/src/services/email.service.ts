import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';

    if (this.isDevelopment) {
      // In dev mode, just log emails to console
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    } else {
      // Production email configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendConfirmationEmail(
    email: string,
    token: string,
    fullName: string,
  ): Promise<void> {
    const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirm-email?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@razmenavrtica.rs',
      to: email,
      subject: 'Potvrdite vašu email adresu - Razmena Vrtica',
      html: `
        <h2>Dobrodošli, ${fullName}!</h2>
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
        Dobrodošli, ${fullName}!
        
        Hvala što ste se registrovali na Razmena Vrtica platformu.
        
        Molimo vas da potvrdite vašu email adresu klikom na sledeći link:
        ${confirmUrl}
        
        Link je validan 24 sata.
        
        Ako niste vi kreirali ovaj nalog, možete ignorisati ovaj email.
      `,
    };

    if (this.isDevelopment) {
      // In dev mode, log to console instead of sending
      console.log('\n=== DEV MODE: Email Confirmation ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Confirmation URL: ${confirmUrl}`);
      console.log('====================================\n');
    } else {
      await this.transporter.sendMail(mailOptions);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    fullName: string,
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@razmenavrtica.rs',
      to: email,
      subject: 'Resetovanje lozinke - Razmena Vrtica',
      html: `
        <h2>Zdravo, ${fullName}!</h2>
        <p>Primili smo zahtev za resetovanje vaše lozinke.</p>
        <p>Kliknite na link ispod da resetujete lozinku:</p>
        <p><a href="${resetUrl}">Resetuj lozinku</a></p>
        <p>Ili kopirajte sledeći link u vaš pretraživač:</p>
        <p>${resetUrl}</p>
        <p>Link je validan 1 sat.</p>
        <br>
        <p>Ako niste vi zatražili resetovanje lozinke, možete ignorisati ovaj email.</p>
      `,
      text: `
        Zdravo, ${fullName}!
        
        Primili smo zahtev za resetovanje vaše lozinke.
        
        Kliknite na sledeći link da resetujete lozinku:
        ${resetUrl}
        
        Link je validan 1 sat.
        
        Ako niste vi zatražili resetovanje lozinke, možete ignorisati ovaj email.
      `,
    };

    if (this.isDevelopment) {
      console.log('\n=== DEV MODE: Password Reset ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('================================\n');
    } else {
      await this.transporter.sendMail(mailOptions);
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

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@razmenavrtica.rs',
      to: email,
      subject: 'Pronađena razmena za vaše dete - Razmena Vrtica',
      html: `
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
      `,
      text: `
        Zdravo, ${fullName}!
        
        Odlične vesti! Pronašli smo potencijalnu razmenu za ${childName}.
        
        Detalji razmene:
        - Broj učesnika: ${matchDetails.participantCount} dece
        - Ciljna vrtić: ${matchDetails.targetKindergartenName}
        
        Prijavite se na platformu da vidite sve detalje razmene i kontaktirate druge roditelje:
        ${dashboardUrl}
        
        Razmena je automatski kreirana na osnovu vaših željenih vrtića. Možete je pregledati, kontaktirati druge roditelje i dogovoriti detalje.
        
        Napomena: Razmena ostaje aktivna dok svi učesnici ne potvrde ili dok neko ne otkaže.
      `,
    };

    if (this.isDevelopment) {
      console.log('\n=== DEV MODE: Match Found Notification ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Child: ${childName}`);
      console.log(`Match ID: ${matchDetails.matchId}`);
      console.log(`Participants: ${matchDetails.participantCount}`);
      console.log(`Target Kindergarten: ${matchDetails.targetKindergartenName}`);
      console.log(`Dashboard URL: ${dashboardUrl}`);
      console.log('==========================================\n');
    } else {
      await this.transporter.sendMail(mailOptions);
    }
  }
}
