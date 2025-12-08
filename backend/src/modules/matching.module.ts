import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingService } from '../services/matching.service';
import { MatchingController } from '../controllers/matching.controller';
import { Child } from '../entities/child.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from '../entities/match.entity';
import { HiddenMatch } from '../entities/hidden-match.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Child,
      Wishlist,
      MatchGroup,
      MatchParticipant,
      HiddenMatch,
    ]),
  ],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
