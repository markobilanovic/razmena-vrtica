import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MatchingService } from '../services/matching.service';
import { AgeGroup } from '@repo/shared';
import { Kindergarten } from '../entities/kindergarten.entity';
import { MatchGroup } from '../entities/match.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type {
  CheckMatchesRequest,
  CreateMatchRequest,
  ValidateMatchResponse,
  HideMatchResponse,
} from '@repo/shared';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  /**
   * Get potential matches
   * Optional query parameter: ageGroup to filter by specific age group
   */
  @Get('potential')
  async getPotentialMatches(@Query('ageGroup') ageGroup?: AgeGroup) {
    return this.matchingService.findPotentialMatches(ageGroup);
  }

  /**
   * Find direct matches for a specific child
   * Returns a list of kindergartens that the child can switch to immediately
   */
  @Post('check-matches')
  async checkMatches(
    @Body() body: CheckMatchesRequest,
  ): Promise<Kindergarten[]> {
    return this.matchingService.findDirectMatchesForChild(body.childId);
  }

  /**
   * Create a new match from a list of child IDs
   * All children MUST be in the same age group
   */
  @Post('create')
  async createMatch(@Body() body: CreateMatchRequest): Promise<MatchGroup> {
    return this.matchingService.createMatch(body.childIds);
  }

  /**
   * Get all matches for a specific age group
   */
  @Get('by-age-group/:ageGroup')
  async getMatchesByAgeGroup(
    @Param('ageGroup') ageGroup: AgeGroup,
  ): Promise<MatchGroup[]> {
    return this.matchingService.getMatchesByAgeGroup(ageGroup);
  }

  /**
   * Validate that a match contains only children from the same age group
   */
  @Get('validate/:matchId')
  async validateMatch(
    @Param('matchId') matchId: string,
  ): Promise<ValidateMatchResponse> {
    const valid = await this.matchingService.validateMatchAgeGroup(matchId);
    return { valid };
  }

  /**
   * Get all match groups involved for a specific child, filtered by user's hide preferences
   */
  @UseGuards(JwtAuthGuard)
  @Get('child/:childId/groups')
  async getMatchGroupsForChild(
    @Param('childId') childId: string,
    @Request() req,
  ): Promise<MatchGroup[]> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Use the filtered method that respects user's hide preferences
    return this.matchingService.getVisibleMatchesForUser(req.user.id, childId);
  }

  /**
   * Hide a match for the authenticated user
   * Only allows hiding matches that involve the user's children and are in canceled state
   */
  @UseGuards(JwtAuthGuard)
  @Post(':matchId/hide')
  async hideMatch(
    @Param('matchId') matchId: string,
    @Request() req,
  ): Promise<HideMatchResponse> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      // Validate that the match exists and is in canceled state
      const match = await this.matchingService.findMatchGroupById(matchId);
      if (!match) {
        throw new NotFoundException('Match not found');
      }

      // Check if match is in canceled or completed state
      if (match.status !== 'CANCELLED' && match.status !== 'COMPLETED') {
        throw new BadRequestException('Only canceled or completed matches can be hidden');
      }

      // Verify user has permission to hide this match (user's child is involved)
      const userHasPermission = await this.matchingService.userCanAccessMatch(
        req.user.id,
        matchId,
      );
      if (!userHasPermission) {
        throw new UnauthorizedException(
          'You can only hide matches involving your children',
        );
      }

      await this.matchingService.hideMatchForUser(req.user.id, matchId);

      return {
        success: true,
        message: 'Match hidden successfully',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to hide match');
    }
  }

  /**
   * Unhide a match for the authenticated user
   * Removes the match from the user's hidden list
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':matchId/hide')
  async unhideMatch(
    @Param('matchId') matchId: string,
    @Request() req,
  ): Promise<HideMatchResponse> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      // Validate that the match exists
      const match = await this.matchingService.findMatchGroupById(matchId);
      if (!match) {
        throw new NotFoundException('Match not found');
      }

      // Verify user has permission to unhide this match
      const userHasPermission = await this.matchingService.userCanAccessMatch(
        req.user.id,
        matchId,
      );
      if (!userHasPermission) {
        throw new UnauthorizedException(
          'You can only unhide matches involving your children',
        );
      }

      await this.matchingService.unhideMatchForUser(req.user.id, matchId);

      return {
        success: true,
        message: 'Match unhidden successfully',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to unhide match');
    }
  }

  /**
   * Confirm that a match has been completed
   * Sets the match status to COMPLETED
   */
  @UseGuards(JwtAuthGuard)
  @Post(':matchId/complete')
  async completeMatch(
    @Param('matchId') matchId: string,
    @Request() req,
  ): Promise<HideMatchResponse> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      const match = await this.matchingService.findMatchGroupById(matchId);
      if (!match) {
        throw new NotFoundException('Match not found');
      }

      // Verify user has permission
      const userHasPermission = await this.matchingService.userCanAccessMatch(
        req.user.id,
        matchId,
      );
      if (!userHasPermission) {
        throw new UnauthorizedException(
          'You can only complete matches involving your children',
        );
      }

      // Only allow completing active matches
      if (match.status !== 'ACTIVE') {
        throw new BadRequestException('Only active matches can be completed');
      }

      await this.matchingService.completeMatch(matchId);

      return {
        success: true,
        message: 'Match marked as completed',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to complete match');
    }
  }

  /**
   * Cancel a match
   * Sets the match status to CANCELLED
   */
  @UseGuards(JwtAuthGuard)
  @Post(':matchId/cancel')
  async cancelMatch(
    @Param('matchId') matchId: string,
    @Request() req,
  ): Promise<HideMatchResponse> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      const match = await this.matchingService.findMatchGroupById(matchId);
      if (!match) {
        throw new NotFoundException('Match not found');
      }

      // Verify user has permission
      const userHasPermission = await this.matchingService.userCanAccessMatch(
        req.user.id,
        matchId,
      );
      if (!userHasPermission) {
        throw new UnauthorizedException(
          'You can only cancel matches involving your children',
        );
      }

      // Only allow canceling active matches
      if (match.status !== 'ACTIVE') {
        throw new BadRequestException('Only active matches can be cancelled');
      }

      await this.matchingService.cancelMatch(matchId);

      return {
        success: true,
        message: 'Match cancelled successfully',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to cancel match');
    }
  }
}
