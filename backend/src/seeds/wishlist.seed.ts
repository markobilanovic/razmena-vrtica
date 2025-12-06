import { DataSource, Not } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';
import { Child } from '../entities/child.entity';
import { Kindergarten } from '../entities/kindergarten.entity';

export async function seedWishlists(dataSource: DataSource, children: Child[]): Promise<Wishlist[]> {
    const wishlistRepository = dataSource.getRepository(Wishlist);
    const kindergartenRepository = dataSource.getRepository(Kindergarten);

    const allKindergartens = await kindergartenRepository.find();

    // Helper to get random item from array, excluding specific ID
    const getRandomTarget = (currentId: string): Kindergarten => {
        const potential = allKindergartens.filter(k => k.id !== currentId);
        return potential[Math.floor(Math.random() * potential.length)];
    };

    const wishlists: Wishlist[] = [];

    // Create 1-3 wishes for each child
    for (const child of children) {
        if (!child.current_kindergarten) continue; // Should have one

        const numberOfWishes = Math.floor(Math.random() * 3) + 1; // 1 to 3 wishes
        const usedTargetIds = new Set<string>();

        for (let i = 0; i < numberOfWishes; i++) {
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
