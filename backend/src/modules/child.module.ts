import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildService } from '../services/child.service';
import { ChildController } from '../controllers/child.controller';
import { Child } from '../entities/child.entity';
import { MatchingModule } from './matching.module';

@Module({
  imports: [TypeOrmModule.forFeature([Child]), MatchingModule],
  providers: [ChildService],
  controllers: [ChildController],
  exports: [ChildService],
})
export class ChildModule {}
