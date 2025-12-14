import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Query,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const loginResult = await this.authService.login(req.user);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${loginResult.access_token}`;
    
    return res.redirect(redirectUrl);
  }
}
