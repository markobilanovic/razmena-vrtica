import { DataSource } from 'typeorm';
import { Kindergarten } from '../entities/kindergarten.entity';
import { Child, AgeGroup, Gender } from '../entities/child.entity';
import { User } from '../entities/user.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from '../entities/match.entity';
import { HiddenMatch } from '../entities/hidden-match.entity';
import { MatchingService } from '../services/matching.service';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'razmena_vrtica',
  entities: [Kindergarten, Child, User, Wishlist, MatchGroup, MatchParticipant, HiddenMatch],
  synchronize: false, // Don't sync, just use existing schema
});

async function verifyDirectMatch() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connection established!');

    // Repositories
    const kgRepo = AppDataSource.getRepository(Kindergarten);
    const userRepo = AppDataSource.getRepository(User);
    const childRepo = AppDataSource.getRepository(Child);
    const wishlistRepo = AppDataSource.getRepository(Wishlist);
    const matchGroupRepo = AppDataSource.getRepository(MatchGroup);
    const matchParticipantRepo = AppDataSource.getRepository(MatchParticipant);
    const hiddenMatchRepo = AppDataSource.getRepository(HiddenMatch);

    // Instantiate Service
    const matchingService = new MatchingService(
      childRepo,
      wishlistRepo,
      matchGroupRepo,
      matchParticipantRepo,
      hiddenMatchRepo,
    );

    console.log('Creating test data...');
    // 1. Create 2 Kindergartens
    const kg1 = kgRepo.create({
      name: 'KG_Test_A',
      city: 'TestCity',
      address: 'Address A',
    });
    const kg2 = kgRepo.create({
      name: 'KG_Test_B',
      city: 'TestCity',
      address: 'Address B',
    });
    await kgRepo.save([kg1, kg2]);

    // 2. Create Parent
    const parent = userRepo.create({
      email: `test_parent_${Date.now()}@example.com`,
      full_name: 'Test Parent',
      password_hash: 'hash',
    });
    await userRepo.save(parent);

    // 3. Create Child 1 in KG1, Wants KG2
    const child1 = childRepo.create({
      name: 'Child A',
      birth_date: new Date('2020-01-01'),
      gender: Gender.MALE,
      group: AgeGroup.MLADJA,
      age_group: 3, // Numeric mapping logic might differ but let's assume valid
      parent: parent,
      current_kindergarten: kg1,
    });
    await childRepo.save(child1);

    const wish1 = wishlistRepo.create({
      child: child1,
      target_kindergarten: kg2,
    });
    await wishlistRepo.save(wish1);

    // 4. Create Child 2 in KG2, Wants KG1
    const child2 = childRepo.create({
      name: 'Child B',
      birth_date: new Date('2020-01-01'),
      gender: Gender.FEMALE,
      group: AgeGroup.MLADJA, // Same group
      age_group: 3,
      parent: parent,
      current_kindergarten: kg2,
    });
    await childRepo.save(child2);

    const wish2 = wishlistRepo.create({
      child: child2,
      target_kindergarten: kg1,
    });
    await wishlistRepo.save(wish2);

    console.log(`Created Child A (${child1.id}) in KG A, wants KG B`);
    console.log(`Created Child B (${child2.id}) in KG B, wants KG A`);

    // 5. Test finding matches for Child 1
    console.log('Finding matches for Child A...');
    const matchesForA = await matchingService.findDirectMatchesForChild(
      child1.id,
    );
    console.log(
      'Matches for A:',
      matchesForA.map((k) => k.name),
    );

    if (matchesForA.length === 1 && matchesForA[0].id === kg2.id) {
      console.log('✅ SUCCESS: Child A has a match with KG B!');
    } else {
      console.error('❌ FAILURE: Expected match with KG B, got:', matchesForA);
    }

    // 6. Test finding matches for Child 2
    console.log('Finding matches for Child B...');
    const matchesForB = await matchingService.findDirectMatchesForChild(
      child2.id,
    );
    console.log(
      'Matches for B:',
      matchesForB.map((k) => k.name),
    );

    if (matchesForB.length === 1 && matchesForB[0].id === kg1.id) {
      console.log('✅ SUCCESS: Child B has a match with KG A!');
    } else {
      console.error('❌ FAILURE: Expected match with KG A, got:', matchesForB);
    }

    // Cleanup
    console.log('Cleaning up...');
    await wishlistRepo.remove([wish1, wish2]);
    await childRepo.remove([child1, child2]);
    await userRepo.remove(parent);
    await kgRepo.remove([kg1, kg2]);
    console.log('Cleanup done.');
  } catch (error) {
    console.error('Error in verification:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

verifyDirectMatch();
