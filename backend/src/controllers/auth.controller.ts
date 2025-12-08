import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Query,
  Get,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
} from '@repo/shared';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() signInDto: LoginRequest): Promise<LoginResponse> {
    const user = await this.authService.validateUser(
      signInDto.email,
      signInDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(
    @Body() signUpDto: RegisterRequest,
  ): Promise<RegisterResponse> {
    return this.authService.register(signUpDto);
  }

  @Get('confirm-email')
  async confirmEmail(
    @Query('token') token: string,
  ): Promise<{ message: string }> {
    return this.authService.confirmEmail(token);
  }

  @Post('resend-confirmation')
  @HttpCode(HttpStatus.OK)
  async resendConfirmation(
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    return this.authService.resendConfirmationEmail(email);
  }
}
