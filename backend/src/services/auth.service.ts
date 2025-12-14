import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private isDevelopment: boolean;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user && user.password_hash) {
      const isMatch = await bcrypt.compare(pass, user.password_hash);
      if (isMatch) {
        // In production, check email confirmation
        if (!this.isDevelopment && !user.email_confirmed) {
          throw new UnauthorizedException(
            'Please confirm your email before logging in',
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, email_confirmation_token, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
    };
  }

  async register(user: any) {
    const { email, password, fullName } = user;
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24); // 24 hours

    const newUser = this.usersRepository.create({
      email,
      password_hash: hashedPassword,
      full_name: fullName,
      email_confirmed: this.isDevelopment, // Auto-confirm in dev mode
      email_confirmation_token: this.isDevelopment ? null : confirmationToken,
      email_confirmation_token_expires: this.isDevelopment
        ? null
        : tokenExpires,
    });

    await this.usersRepository.save(newUser);

    // Send confirmation email only in production
    if (!this.isDevelopment) {
      await this.emailService.sendConfirmationEmail(
        email,
        confirmationToken,
        fullName,
      );
    }

    return this.login(newUser);
  }

  async confirmEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { email_confirmation_token: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid confirmation token');
    }

    if (user.email_confirmed) {
      return { message: 'Email already confirmed' };
    }

    if (
      user.email_confirmation_token_expires &&
      new Date() > user.email_confirmation_token_expires
    ) {
      throw new BadRequestException('Confirmation token has expired');
    }

    user.email_confirmed = true;
    user.email_confirmation_token = null;
    user.email_confirmation_token_expires = null;
    await this.usersRepository.save(user);

    return { message: 'Email confirmed successfully' };
  }

  async resendConfirmationEmail(email: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.email_confirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24);

    user.email_confirmation_token = confirmationToken;
    user.email_confirmation_token_expires = tokenExpires;
    await this.usersRepository.save(user);

    await this.emailService.sendConfirmationEmail(
      email,
      confirmationToken,
      user.full_name,
    );

    return { message: 'Confirmation email sent' };
  }

  async validateGoogleUser(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    googleId: string;
  }): Promise<any> {
    const { email, firstName, lastName, googleId } = googleUser;
    
    let user = await this.usersRepository.findOne({ where: { email } });
    
    if (user) {
      // Update existing user with Google ID if not set
      if (!user.google_id) {
        user.google_id = googleId;
        await this.usersRepository.save(user);
      }
    } else {
      // Create new user from Google profile
      user = this.usersRepository.create({
        email,
        full_name: `${firstName} ${lastName}`,
        google_id: googleId,
        email_confirmed: true, // Google emails are pre-verified
        password_hash: null, // No password for OAuth users
      });
      await this.usersRepository.save(user);
    }

    const { password_hash, email_confirmation_token, ...result } = user;
    return result;
  }
}
