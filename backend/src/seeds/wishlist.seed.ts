import { DataSource, Not } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';
import { Child } from '../entities/child.entity';
import { Kindergarten } from '../entities/kindergarten.entity';

export async function seedWishlists(
  dataSource: DataSource,
  children: Child[],
): Promise<Wishlist[]> {
  const wishlistRepository = dataSource.getRepository(Wishlist);
  const kindergartenRepository = dataSource.getRepository(Kindergarten);

  const allKindergartens = await kindergartenRepository.find();

  // Helper to get random item from array, excluding specific ID
  const getRandomTarget = (currentId: string): Kindergarten => {
    const potential = allKindergartens.filter((k) => k.id !== currentId);
    return potential[Math.floor(Math.random() * potential.length)];
  };

  const wishlists: Wishlist[] = [];

  // GUARANTEE AT LEAST ONE MUTUAL SWAP FOR DEMO PURPOSES
  // Find first two children with same age group and different kindergartens
  let guaranteedSwapCreated = false;
  for (let i = 0; i < children.length && !guaranteedSwapCreated; i++) {
    for (let j = i + 1; j < children.length; j++) {
      const child1 = children[i];
      const child2 = children[j];

      if (
        child1.group === child2.group &&
        child1.current_kindergarten_id !== child2.current_kindergarten_id &&
        child1.current_kindergarten &&
        child2.current_kindergarten
      ) {
        // Create mutual wishes: child1 wants child2's KG, child2 wants child1's KG
        const wish1 = new Wishlist();
        wish1.child = child1;
        wish1.target_kindergarten = child2.current_kindergarten;
        wishlists.push(wish1);

        const wish2 = new Wishlist();
        wish2.child = child2;
        wish2.target_kindergarten = child1.current_kindergarten;
        wishlists.push(wish2);

        console.log(
          `✅ Guaranteed mutual swap: ${child1.name} ↔️ ${child2.name}`,
        );
        guaranteedSwapCreated = true;
        break;
      }
    }
  }

  // Create 1-3 additional random wishes for each child
  for (const child of children) {
    if (!child.current_kindergarten) continue; // Should have one

    // Check how many wishes this child already has
    const existingWishCount = wishlists.filter(
      (w) => w.child.id === child.id,
    ).length;

    // Add random wishes to reach 1-3 total wishes
    const totalWishes = Math.floor(Math.random() * 3) + 1; // 1 to 3 wishes
    const additionalWishes = Math.max(0, totalWishes - existingWishCount);
    const usedTargetIds = new Set<string>(
      wishlists
        .filter((w) => w.child.id === child.id)
        .map((w) => w.target_kindergarten.id),
    );

    for (let i = 0; i < additionalWishes; i++) {
      const targetInfo = getRandomTarget(child.current_kindergarten.id);

      // Avoid duplicate wishes for same child
      if (usedTargetIds.has(targetInfo.id)) continue;
      usedTargetIds.add(targetInfo.id);

      const wishlist = new Wishlist();
      wishlist.child = child;
      wishlist.target_kindergarten = targetInfo;
      wishlists.push(wishlist);
    }
  }

  const savedWishlists = await wishlistRepository.save(wishlists);
  console.log(`Successfully seeded ${savedWishlists.length} wishlists!`);
  return savedWishlists;
}
