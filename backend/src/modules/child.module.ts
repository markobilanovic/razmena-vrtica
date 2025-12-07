import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildService } from '../services/child.service';
import { ChildController } from '../controllers/child.controller';
import { Child } from '../entities/child.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Child])],
  providers: [ChildService],
  controllers: [ChildController],
  exports: [ChildService],
})
export class ChildModule {}
