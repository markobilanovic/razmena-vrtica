import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from '../services/wishlist.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type {
  CreateWishlistRequest,
  UpdateWishlistRequest,
  WishlistResponse,
} from '@repo/shared';

@Controller('wishlists')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  async create(@Body() body: CreateWishlistRequest): Promise<WishlistResponse> {
    return this.wishlistService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateWishlistRequest,
  ): Promise<WishlistResponse> {
    return this.wishlistService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.wishlistService.delete(id);
    return { success: true };
  }

  @Get('child/:childId')
  async getByChild(@Param('childId') childId: string): Promise<WishlistResponse[]> {
    return this.wishlistService.findByChild(childId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<WishlistResponse> {
    const wishlist = await this.wishlistService.findOne(id);
    if (!wishlist) {
      throw new Error('Wishlist not found');
    }
    return wishlist;
  }
}

