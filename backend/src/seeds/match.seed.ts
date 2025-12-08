import { DataSource } from 'typeorm';
import { MatchGroup, MatchParticipant } from '../entities/match.entity';
import { MatchStatus } from '@repo/shared';
import { Child } from '../entities/child.entity';
import { Wishlist } from '../entities/wishlist.entity';

export async function seedMatches(
  dataSource: DataSource,
  children: Child[],
): Promise<void> {
  const matchGroupRepository = dataSource.getRepository(MatchGroup);
  const participantRepo = dataSource.getRepository(MatchParticipant);
  const wishlistRepository = dataSource.getRepository(Wishlist);

  // We will create matches based on actual mutual preferences in wishlists
  if (children.length < 4) {
    console.log('Not enough children to seed matches properly.');
    return;
  }

  // Load all wishlists with relations
  const allWishlists = await wishlistRepository.find({
    relations: ['child', 'target_kindergarten', 'child.current_kindergarten'],
  });

  // Helper to find if two children have mutual preferences (direct swap)
  const findMutualSwap = (
    child1: Child,
    child2: Child,
  ): { child1: Child; child2: Child } | null => {
    const child1Wishlists = allWishlists.filter(
      (w) => w.child.id === child1.id,
    );
    const child2Wishlists = allWishlists.filter(
      (w) => w.child.id === child2.id,
    );

    // Check if child1 wants child2's kindergarten AND child2 wants child1's kindergarten
    const child1WantsChild2KG = child1Wishlists.some(
      (w) => w.target_kindergarten_id === child2.current_kindergarten_id,
    );
    const child2WantsChild1KG = child2Wishlists.some(
      (w) => w.target_kindergarten_id === child1.current_kindergarten_id,
    );

    if (child1WantsChild2KG && child2WantsChild1KG) {
      return { child1, child2 };
    }
    return null;
  };

  let matchesCreated = 0;

  // Try to find at least 2 mutual swaps from the children
  // Scenario 1: Find first mutual swap (Pending)
  for (let i = 0; i < children.length && matchesCreated < 1; i++) {
    for (let j = i + 1; j < children.length; j++) {
      const child1 = children[i];
      const child2 = children[j];

      // Ensure they have different kindergartens and same age group
      if (
        child1.current_kindergarten_id !== child2.current_kindergarten_id &&
        child1.group === child2.group
      ) {
        const mutualSwap = findMutualSwap(child1, child2);

        if (mutualSwap) {
          // Create active match with one participant not yet accepted
          const group1 = new MatchGroup();
          group1.status = MatchStatus.ACTIVE;
          await matchGroupRepository.save(group1);

          const p1 = new MatchParticipant();
          p1.match_group = group1;
          p1.child = child1;
          p1.next_child = child2;
          p1.has_accepted = true; // One accepted

          const p2 = new MatchParticipant();
          p2.match_group = group1;
          p2.child = child2;
          p2.next_child = child1;
          p2.has_accepted = false; // Still pending

          await participantRepo.save([p1, p2]);
          console.log(
            `✅ Seeded Scenario 1: Active Match (pending acceptance) between ${child1.name} and ${child2.name}`,
          );
          matchesCreated++;
          break;
        }
      }
    }
  }

  // Scenario 2: Find second mutual swap (Active Contact)
  for (let i = 0; i < children.length && matchesCreated < 2; i++) {
    for (let j = i + 1; j < children.length; j++) {
      const child1 = children[i];
      const child2 = children[j];

      // Skip if already used in previous match
      if (matchesCreated >= 1) {
        // Don't reuse children from match 1
        // For simplicity, we just continue searching from different indices
      }

      // Ensure they have different kindergartens and same age group
      if (
        child1.current_kindergarten_id !== child2.current_kindergarten_id &&
        child1.group === child2.group
      ) {
        const mutualSwap = findMutualSwap(child1, child2);

        if (mutualSwap) {
          // Create active match with all participants accepted
          const group2 = new MatchGroup();
          group2.status = MatchStatus.ACTIVE;
          await matchGroupRepository.save(group2);

          const p3 = new MatchParticipant();
          p3.match_group = group2;
          p3.child = child1;
          p3.next_child = child2;
          p3.has_accepted = true;

          const p4 = new MatchParticipant();
          p4.match_group = group2;
          p4.child = child2;
          p4.next_child = child1;
          p4.has_accepted = true;

          await participantRepo.save([p3, p4]);
          console.log(
            `✅ Seeded Scenario 2: Active Match (all accepted) between ${child1.name} and ${child2.name}`,
          );
          matchesCreated++;
          break;
        }
      }
    }
  }

  if (matchesCreated === 0) {
    console.log('⚠️  No mutual swaps found in wishlists. No matches created.');
    console.log(
      '💡 This means no two children want each others kindergartens.',
    );
    console.log(
      '   Consider adjusting the wishlist seed to guarantee at least one mutual swap.',
    );
  } else {
    console.log(
      `✅ Match seeding completed. Created ${matchesCreated} matches.`,
    );
  }
}
