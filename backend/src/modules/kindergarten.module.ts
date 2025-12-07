import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kindergarten } from '../entities/kindergarten.entity';
import { KindergartenService } from '../services/kindergarten.service';
import { KindergartenController } from '../controllers/kindergarten.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Kindergarten])],
  controllers: [KindergartenController],
  providers: [KindergartenService],
  exports: [KindergartenService],
})
export class KindergartenModule {}

