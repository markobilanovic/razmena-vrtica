import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child, AgeGroup } from '../entities/child.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { Kindergarten } from '../entities/kindergarten.entity';
import { MatchGroup, MatchParticipant, MatchStatus } from '../entities/match.entity';

export interface PotentialMatch {
    children: Child[];
    targetKindergartens: string[];
}

@Injectable()
export class MatchingService {
    constructor(
        @InjectRepository(Child)
        private childRepository: Repository<Child>,
        @InjectRepository(Wishlist)
        private wishlistRepository: Repository<Wishlist>,
        @InjectRepository(MatchGroup)
        private matchGroupRepository: Repository<MatchGroup>,
        @InjectRepository(MatchParticipant)
        private matchParticipantRepository: Repository<MatchParticipant>,
    ) { }

    /**
     * Find potential matches for children who want to swap kindergartens
     * IMPORTANT: Children can only be matched if they are in the same age group
     */
    async findPotentialMatches(ageGroup?: AgeGroup): Promise<PotentialMatch[]> {
        // Get all children with their wishlists
        const childrenQuery = this.childRepository
            .createQueryBuilder('child')
            .leftJoinAndSelect('child.wishlists', 'wishlist')
            .leftJoinAndSelect('child.current_kindergarten', 'current_kindergarten')
            .leftJoinAndSelect('wishlist.target_kindergarten', 'target_kindergarten');

        // Filter by age group if provided
        if (ageGroup) {
            childrenQuery.where('child.group = :ageGroup', { ageGroup });
        }

        const children = await childrenQuery.getMany();

        // Group children by their age group to ensure matches are only within same group
        const childrenByAgeGroup = new Map<AgeGroup, Child[]>();

        for (const child of children) {
            if (!child.group) {
                console.warn(`Child ${child.id} does not have an age group assigned`);
                continue;
            }

            if (!childrenByAgeGroup.has(child.group)) {
                childrenByAgeGroup.set(child.group, []);
            }
            childrenByAgeGroup.get(child.group)!.push(child);
        }

        const potentialMatches: PotentialMatch[] = [];

        // Process each age group separately
        for (const [group, groupChildren] of childrenByAgeGroup) {
            const groupMatches = this.findMatchesInAgeGroup(groupChildren);
            potentialMatches.push(...groupMatches);
        }

        return potentialMatches;
    }

    /**
     * Find matches within a specific age group
     * This ensures children are only matched with others in the same age group
     */
    private findMatchesInAgeGroup(children: Child[]): PotentialMatch[] {
        const potentialMatches: PotentialMatch[] = [];

        // Create a map of current kindergarten -> children who want to leave
        const childrenByCurrentKG = new Map<string, Child[]>();

        for (const child of children) {
            if (child.wishlists && child.wishlists.length > 0) {
                const currentKGId = child.current_kindergarten_id;
                if (!childrenByCurrentKG.has(currentKGId)) {
                    childrenByCurrentKG.set(currentKGId, []);
                }
                childrenByCurrentKG.get(currentKGId)!.push(child);
            }
        }

        // Look for direct swaps (2-way matches)
        for (const child1 of children) {
            if (!child1.wishlists || child1.wishlists.length === 0) continue;

            for (const wishlist1 of child1.wishlists) {
                const desiredKGId = wishlist1.target_kindergarten_id;
                const childrenAtDesiredKG = childrenByCurrentKG.get(desiredKGId) || [];

                for (const child2 of childrenAtDesiredKG) {
                    // Check if child2 wants to go to child1's current kindergarten
                    const wantsChild1KG = child2.wishlists.some(
                        w => w.target_kindergarten_id === child1.current_kindergarten_id
                    );

                    if (wantsChild1KG && child1.id !== child2.id) {
                        // Verify they are in the same age group (double-check)
                        if (child1.group === child2.group) {
                            potentialMatches.push({
                                children: [child1, child2],
                                targetKindergartens: [
                                    child2.current_kindergarten_id,
                                    child1.current_kindergarten_id,
                                ],
                            });
                        }
                    }
                }
            }
        }

        // TODO: Implement circular matches (3+ way swaps) if needed
        // Circular matches would also need to respect age group constraints

        return potentialMatches;
    }

    /**
     * Create a match group from a potential match
     * Validates that all children are in the same age group before creating
     */
    async createMatch(childIds: string[]): Promise<MatchGroup> {
        if (childIds.length < 2) {
            throw new Error('At least 2 children are required to create a match');
        }

        // Fetch all children
        const children = await this.childRepository.findByIds(childIds);

        if (children.length !== childIds.length) {
            throw new Error('Some children were not found');
        }

        // CRITICAL: Validate all children are in the same age group
        const ageGroups = new Set(children.map(c => c.group));
        if (ageGroups.size > 1) {
            throw new Error(
                `Cannot create match: children must be in the same age group. ` +
                `Found groups: ${Array.from(ageGroups).join(', ')}`
            );
        }

        // Check if any child lacks an age group
        const hasNullOrUndefined = children.some(c => c.group == null);
        if (hasNullOrUndefined) {
            throw new Error('Cannot create match: some children do not have an age group assigned');
        }

        // Create the match group
        const matchGroup = this.matchGroupRepository.create({
            status: MatchStatus.PENDING_ACCEPTANCE,
        });
        await this.matchGroupRepository.save(matchGroup);

        // Create match participants in circular order
        const participants: MatchParticipant[] = [];
        for (let i = 0; i < children.length; i++) {
            const currentChild = children[i];
            const nextChild = children[(i + 1) % children.length];

            const participant = this.matchParticipantRepository.create({
                match_group_id: matchGroup.id,
                child_id: currentChild.id,
                next_child_id: nextChild.id,
                has_accepted: false,
            });
            participants.push(participant);
        }

        await this.matchParticipantRepository.save(participants);

        return matchGroup;
    }

    /**
     * Get all matches for a specific age group
     */
    async getMatchesByAgeGroup(ageGroup: AgeGroup): Promise<MatchGroup[]> {
        return this.matchGroupRepository
            .createQueryBuilder('matchGroup')
            .leftJoinAndSelect('matchGroup.participants', 'participants')
            .leftJoinAndSelect('participants.child', 'child')
            .where('child.group = :ageGroup', { ageGroup })
            .getMany();
    }

    /**
     * Find direct matches for a specific child
     * Returns a list of kindergartens that the child can switch to immediately
     * (i.e. someone in that kindergarten wants to switch to the child's current kindergarten)
     */
    async findDirectMatchesForChild(childId: string): Promise<Kindergarten[]> {
        // 1. Fetch the child with their wishlists and current kindergarten
        const child = await this.childRepository.findOne({
            where: { id: childId },
            relations: ['wishlists', 'wishlists.target_kindergarten', 'current_kindergarten'],
        });

        if (!child) {
            throw new Error('Child not found');
        }

        if (!child.wishlists || child.wishlists.length === 0) {
            return [];
        }

        const currentKindergartenId = child.current_kindergarten_id;
        const potentialMatches: Kindergarten[] = [];

        // 2. For each kindergarten in the wishlist, check if there's a child there who wants to swap
        for (const wishlist of child.wishlists) {
            const targetKindergarten = wishlist.target_kindergarten;
            const targetKindergartenId = targetKindergarten.id;

            // Find children in the target kindergarten who have the same age group
            const candidates = await this.childRepository.find({
                where: {
                    current_kindergarten_id: targetKindergartenId,
                    group: child.group,
                },
                relations: ['wishlists'],
            });

            // Check if any candidate wants to come to the current kindergarten
            const hasMatch = candidates.some(candidate =>
                candidate.wishlists.some(w => w.target_kindergarten_id === currentKindergartenId)
            );

            if (hasMatch) {
                potentialMatches.push(targetKindergarten);
            }
        }

        return potentialMatches;
    }

    /**
     * Validate that a match only contains children from the same age group
     */
    async validateMatchAgeGroup(matchId: string): Promise<boolean> {
        const match = await this.matchGroupRepository
            .createQueryBuilder('matchGroup')
            .leftJoinAndSelect('matchGroup.participants', 'participants')
            .leftJoinAndSelect('participants.child', 'child')
            .where('matchGroup.id = :matchId', { matchId })
            .getOne();

        if (!match || !match.participants) {
            return false;
        }

        const ageGroups = new Set(
            match.participants.map(p => p.child.group)
        );

        const hasNullOrUndefined = match.participants.some(p => p.child.group == null);
        return ageGroups.size === 1 && !hasNullOrUndefined;
    }
}
