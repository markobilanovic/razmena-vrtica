import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { KindergartenService } from '../services/kindergarten.service';
import { Kindergarten } from '../entities/kindergarten.entity';

@Controller('kindergartens')
export class KindergartenController {
  constructor(private kindergartenService: KindergartenService) {}

  @Get()
  async getAll(): Promise<Kindergarten[]> {
    return this.kindergartenService.findAll();
  }

  @Get('batch')
  async getByIds(
    @Query('ids') ids: string | string[],
  ): Promise<Kindergarten[]> {
    // Handle both single string and array of strings
    const idArray = Array.isArray(ids) ? ids : ids.split(',');

    if (idArray.length === 0) {
      throw new BadRequestException('At least one kindergarten ID is required');
    }

    return this.kindergartenService.findByIds(idArray);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Kindergarten> {
    const kindergarten = await this.kindergartenService.findOneById(id);
    if (!kindergarten) {
      throw new NotFoundException('Kindergarten not found');
    }
    return kindergarten;
  }
}
