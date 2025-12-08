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
}
