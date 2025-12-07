import {
  Controller,
  Get,
  Request,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { UserProfile } from '@repo/shared';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req): Promise<UserProfile> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException();
    }
    const user = await this.usersService.findOneById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
