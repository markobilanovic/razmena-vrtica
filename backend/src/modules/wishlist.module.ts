import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistService } from '../services/wishlist.service';
import { WishlistController } from '../controllers/wishlist.controller';
import { Wishlist } from '../entities/wishlist.entity';
import { Child } from '../entities/child.entity';
import { Kindergarten } from '../entities/kindergarten.entity';
import { MatchingModule } from './matching.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wishlist, Child, Kindergarten]),
    MatchingModule,
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}

