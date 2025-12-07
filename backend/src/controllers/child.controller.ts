import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ChildService } from '../services/child.service';
import { Child, Gender, AgeGroup } from '../entities/child.entity';

interface CreateChildDto {
  name: string;
  birth_date?: string;
  gender?: Gender;
  group: AgeGroup;
  current_kindergarten_id: string;
}

@Controller('children')
export class ChildController {
  constructor(private childService: ChildService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createChild(
    @Request() req,
    @Body() createChildDto: CreateChildDto,
  ): Promise<Child> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException();
    }

    try {
      const child = await this.childService.create({
        name: createChildDto.name,
        birth_date: createChildDto.birth_date
          ? new Date(createChildDto.birth_date)
          : undefined,
        gender: createChildDto.gender,
        group: createChildDto.group,
        current_kindergarten_id: createChildDto.current_kindergarten_id,
        parent_id: req.user.id,
      });

      return child;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create child',
      );
    }
  }
}
