import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MatchingService } from '../services/matching.service';
import { AgeGroup } from '../entities/child.entity';
import { Kindergarten } from '../entities/kindergarten.entity';
import { MatchGroup } from '../entities/match.entity';

@Controller('matching')
export class MatchingController {
    constructor(private readonly matchingService: MatchingService) { }

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
    async checkMatches(@Body() body: { childId: string }): Promise<Kindergarten[]> {
        return this.matchingService.findDirectMatchesForChild(body.childId);
    }

    /**
     * Create a new match from a list of child IDs
     * All children MUST be in the same age group
     */
    @Post('create')
    async createMatch(@Body() body: { childIds: string[] }): Promise<MatchGroup> {
        return this.matchingService.createMatch(body.childIds);
    }

    /**
     * Get all matches for a specific age group
     */
    @Get('by-age-group/:ageGroup')
    async getMatchesByAgeGroup(@Param('ageGroup') ageGroup: AgeGroup): Promise<MatchGroup[]> {
        return this.matchingService.getMatchesByAgeGroup(ageGroup);
    }

    /**
     * Validate that a match contains only children from the same age group
     */
    @Get('validate/:matchId')
    async validateMatch(@Param('matchId') matchId: string): Promise<{ valid: boolean }> {
        const valid = await this.matchingService.validateMatchAgeGroup(matchId);
        return { valid };
    }
}
