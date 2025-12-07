import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  Delete,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ChildService } from '../services/child.service';
import { MatchingService } from '../services/matching.service';
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
  constructor(
    private childService: ChildService,
    private matchingService: MatchingService,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteChild(
    @Request() req,
    @Param('id') childId: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException();
    }

    try {
      // First, verify the child exists and belongs to the user
      const child = await this.childService.findOne(childId);

      if (!child) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      if (child.parent_id !== req.user.id) {
        throw new UnauthorizedException(
          'You can only delete your own children',
        );
      }

      // Find and invalidate any matches involving this child
      const matchGroups =
        await this.matchingService.findMatchGroupsForChild(childId);

      if (matchGroups.length > 0) {
        // Invalidate all matches by setting them to CANCELLED
        await this.matchingService.invalidateMatchesForChild(childId);
      }

      // Delete the child (wishlists will be cascade deleted by database)
      await this.childService.delete(childId);

      return {
        success: true,
        message: 'Child deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to delete child',
      );
    }
  }
}
