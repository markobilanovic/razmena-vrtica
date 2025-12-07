import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child, AgeGroup } from '../entities/child.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { Kindergarten } from '../entities/kindergarten.entity';
import {
  MatchGroup,
  MatchParticipant,
  MatchStatus,
} from '../entities/match.entity';

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
  ) {}

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
    // Use the general circle matching algorithm with min depth 2 and max depth 5
    // This will cover both direct swaps (depth 2) and larger circles (3-5)
    return this.findCircleMatches(children, 2, 5);
  }

  /**
   * Find circle matches (cycles) in the preference graph
   * @param children All children in the pool
   * @param minDepth Minimum cycle length (e.g., 2 for direct swap)
   * @param maxDepth Maximum cycle length (e.g., 5)
   */
  private findCircleMatches(
    children: Child[],
    minDepth: number,
    maxDepth: number,
  ): PotentialMatch[] {
    const potentialMatches: PotentialMatch[] = [];
    const uniqueCycleKeys = new Set<string>();

    // 1. Build Adjacency Map: Current Kindergarten ID -> Children currently there (who want to move)
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

    // 2. DFS for Cycle Detection

    // Helper to generate a unique key for a cycle to avoid duplicates
    // Key format: sorted_child_ids_joined_by_comma
    // Example: "id1,id2,id3"
    const getCycleKey = (path: Child[]) => {
      return path
        .map((c) => c.id)
        .sort()
        .join(',');
    };

    const dfs = (
      startChild: Child,
      currentChild: Child,
      path: Child[],
      visitedInPath: Set<string>,
    ) => {
      // Stop if path gets too long
      if (path.length > maxDepth) return;

      // Check if current child wants to go to start child's kindergarten
      // AND we have met the minimum depth requirement
      if (path.length >= minDepth) {
        const wantsStartKG = currentChild.wishlists.some(
          (w) =>
            w.target_kindergarten_id === startChild.current_kindergarten_id,
        );

        if (wantsStartKG) {
          // CYCLE FOUND!
          const cycleKey = getCycleKey(path);
          if (!uniqueCycleKeys.has(cycleKey)) {
            uniqueCycleKeys.add(cycleKey);

            // Construct the PotentialMatch object
            // targetKindergartens should correspond to the children in the path
            // For a cycle A -> B -> C -> A:
            // A moves to B's current KG
            // B moves to C's current KG
            // C moves to A's current KG

            // Path is [A, B, C]
            // Target KGs:
            // A's target is B.current_kindergarten_id
            // B's target is C.current_kindergarten_id
            // C's target is A.current_kindergarten_id

            const targetKGs: string[] = [];
            for (let i = 0; i < path.length; i++) {
              const nextChild = path[(i + 1) % path.length];
              targetKGs.push(nextChild.current_kindergarten_id);
            }

            potentialMatches.push({
              children: [...path],
              targetKindergartens: targetKGs,
            });
          }
          // Continue searching?
          // Usually we can stop this branch here because a larger cycle containing this sub-cycle
          // starting at 'startChild' doesn't make sense in this context
          // (we are looking for simple cycles).
          return;
        }
      }

      // Continue DFS
      // We need to look at where currentChild wants to go
      for (const wish of currentChild.wishlists) {
        const nextKGId = wish.target_kindergarten_id;
        const candidatesAtNextKG = childrenByCurrentKG.get(nextKGId) || [];

        for (const nextChild of candidatesAtNextKG) {
          // Avoid reusing children in the same path
          if (!visitedInPath.has(nextChild.id)) {
            // OPTIMIZATION: Ensure strict ordering for the start node to reduce redundant searches
            // Ensure we only find the cycle starting from the child with the "smallest" ID
            // This canonical form avoids finding A-B-C, B-C-A, and C-A-B separately.
            // However, since we track uniqueCycleKeys, this is just an optimization.
            if (startChild.id < nextChild.id) {
              // This optimization might skip valid paths if we strictly enforce startChild must be smallest.
              // Actually, let's just rely on uniqueCycleKeys for deduplication.
              // But we must strictly avoid cycles within the path itself (visitedInPath handles this).
            }

            // Only recurse if we are still under max depth (path len + 1 <= maxDepth)
            if (path.length + 1 <= maxDepth) {
              visitedInPath.add(nextChild.id);
              path.push(nextChild);

              dfs(startChild, nextChild, path, visitedInPath);

              path.pop();
              visitedInPath.delete(nextChild.id);
            }
          }
        }
      }
    };

    // Start DFS from each child
    for (const child of children) {
      // We start a path with just this child
      dfs(child, child, [child], new Set([child.id]));
    }

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
    const ageGroups = new Set(children.map((c) => c.group));
    if (ageGroups.size > 1) {
      throw new Error(
        `Cannot create match: children must be in the same age group. ` +
          `Found groups: ${Array.from(ageGroups).join(', ')}`,
      );
    }

    // Check if any child lacks an age group
    const hasNullOrUndefined = children.some((c) => c.group == null);
    if (hasNullOrUndefined) {
      throw new Error(
        'Cannot create match: some children do not have an age group assigned',
      );
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
      relations: [
        'wishlists',
        'wishlists.target_kindergarten',
        'current_kindergarten',
      ],
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
      const hasMatch = candidates.some((candidate) =>
        candidate.wishlists.some(
          (w) => w.target_kindergarten_id === currentKindergartenId,
        ),
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

    const ageGroups = new Set(match.participants.map((p) => p.child.group));

    const hasNullOrUndefined = match.participants.some(
      (p) => p.child.group == null,
    );
    return ageGroups.size === 1 && !hasNullOrUndefined;
  }

  /**
   * Find all match groups where a specific child is a participant
   */
  async findMatchGroupsForChild(childId: string): Promise<MatchGroup[]> {
    // We find matches where the child is one of the participants
    // We need to load all participants of that match group to show the full circle
    return this.matchGroupRepository
      .createQueryBuilder('matchGroup')
      .innerJoin('matchGroup.participants', 'participant') // Filter by participant
      .leftJoinAndSelect('matchGroup.participants', 'allParticipants') // Load ALL participants
      .leftJoinAndSelect('allParticipants.child', 'child')
      .leftJoinAndSelect('child.parent', 'parent')
      .leftJoinAndSelect('child.current_kindergarten', 'current_kindergarten')
      .where('participant.child_id = :childId', { childId })
      .orderBy('matchGroup.created_at', 'DESC')
      .getMany();
  }

  /**
   * Check for and automatically create matches for a specific child
   * Called after wishlist changes for that child
   *
   * @param childId - The child whose wishlists changed
   * @returns Array of created matches (could be multiple if child is in multiple cycles)
   */
  async checkAndCreateMatchesForChild(childId: string): Promise<MatchGroup[]> {
    const child = await this.childRepository.findOne({
      where: { id: childId },
      relations: ['current_kindergarten', 'wishlists'],
    });

    if (!child || !child.group) {
      return [];
    }

    // Find all potential matches in this child's age group
    const potentialMatches = await this.findPotentialMatches(child.group);

    const createdMatches: MatchGroup[] = [];

    // Check each potential match to see if this child is involved
    for (const potentialMatch of potentialMatches) {
      const childIds = potentialMatch.children.map((c) => c.id);

      // Only create match if our child is part of it
      if (childIds.includes(childId)) {
        // Check if a match with these exact children already exists
        const existingMatch = await this.findExistingMatch(childIds);

        if (!existingMatch) {
          try {
            const newMatch = await this.createMatch(childIds);
            createdMatches.push(newMatch);
          } catch (error) {
            console.error(
              `Failed to create match for children ${childIds.join(', ')}:`,
              error,
            );
          }
        }
      }
    }

    return createdMatches;
  }

  /**
   * Check if a match with the exact same set of children already exists
   * Used to prevent duplicate matches
   */
  private async findExistingMatch(
    childIds: string[],
  ): Promise<MatchGroup | null> {
    // Get all pending or active matches
    const matches = await this.matchGroupRepository
      .createQueryBuilder('matchGroup')
      .leftJoinAndSelect('matchGroup.participants', 'participants')
      .where('matchGroup.status IN (:...statuses)', {
        statuses: [MatchStatus.PENDING_ACCEPTANCE, MatchStatus.ACTIVE_CONTACT],
      })
      .getMany();

    // Check each match to see if it has the exact same children
    for (const match of matches) {
      const matchChildIds = match.participants.map((p) => p.child_id).sort();
      const sortedInputIds = [...childIds].sort();

      if (
        matchChildIds.length === sortedInputIds.length &&
        matchChildIds.every((id, index) => id === sortedInputIds[index])
      ) {
        return match;
      }
    }

    return null;
  }

  /**
   * Check for matches across an entire age group
   * Useful for batch processing or when multiple wishlists change
   */
  async checkAndCreateMatchesForAgeGroup(
    ageGroup: AgeGroup,
  ): Promise<MatchGroup[]> {
    const potentialMatches = await this.findPotentialMatches(ageGroup);
    const createdMatches: MatchGroup[] = [];

    for (const potentialMatch of potentialMatches) {
      const childIds = potentialMatch.children.map((c) => c.id);

      // Check if match already exists
      const existingMatch = await this.findExistingMatch(childIds);

      if (!existingMatch) {
        try {
          const newMatch = await this.createMatch(childIds);
          createdMatches.push(newMatch);
        } catch (error) {
          console.error(
            `Failed to create match for children ${childIds.join(', ')}:`,
            error,
          );
        }
      }
    }

    return createdMatches;
  }

  /**
   * Invalidate all matches involving a specific child
   * Called when a child is being deleted
   * Sets all matches to CANCELLED status
   */
  async invalidateMatchesForChild(childId: string): Promise<void> {
    const matchGroups = await this.findMatchGroupsForChild(childId);

    for (const matchGroup of matchGroups) {
      // Only invalidate if not already completed or cancelled
      if (
        matchGroup.status !== MatchStatus.COMPLETED &&
        matchGroup.status !== MatchStatus.CANCELLED
      ) {
        matchGroup.status = MatchStatus.CANCELLED;
        await this.matchGroupRepository.save(matchGroup);
      }
    }
  }
}
