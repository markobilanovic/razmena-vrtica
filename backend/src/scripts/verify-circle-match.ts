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
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  entities: [
    Kindergarten,
    Child,
    User,
    Wishlist,
    MatchGroup,
    MatchParticipant,
    HiddenMatch,
  ],
  synchronize: false,
});

async function verifyCircleMatch() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connection established!');

    const kgRepo = AppDataSource.getRepository(Kindergarten);
    const userRepo = AppDataSource.getRepository(User);
    const childRepo = AppDataSource.getRepository(Child);
    const wishlistRepo = AppDataSource.getRepository(Wishlist);
    const matchGroupRepo = AppDataSource.getRepository(MatchGroup);
    const matchParticipantRepo = AppDataSource.getRepository(MatchParticipant);
    const hiddenMatchRepo = AppDataSource.getRepository(HiddenMatch);

    const matchingService = new MatchingService(
      childRepo,
      wishlistRepo,
      matchGroupRepo,
      matchParticipantRepo,
      hiddenMatchRepo,
    );

    console.log('Creating test data for 3-way circle match...');

    // 1. Create 3 Kindergartens
    const kg1 = kgRepo.create({
      name: 'KG_Circle_1',
      city: 'TestCity',
      address: 'Addr 1',
    });
    const kg2 = kgRepo.create({
      name: 'KG_Circle_2',
      city: 'TestCity',
      address: 'Addr 2',
    });
    const kg3 = kgRepo.create({
      name: 'KG_Circle_3',
      city: 'TestCity',
      address: 'Addr 3',
    });
    await kgRepo.save([kg1, kg2, kg3]);

    // 2. Create Parent
    const parent = userRepo.create({
      email: `circle_parent_${Date.now()}@example.com`,
      full_name: 'Circle Parent',
      password_hash: 'hash',
    });
    await userRepo.save(parent);

    // 3. Create Child A in KG1, Wants KG2
    const childA = childRepo.create({
      name: 'Child A',
      birth_date: new Date('2020-01-01'),
      gender: Gender.MALE,
      group: AgeGroup.MLADJA,
      age_group: 3,
      parent: parent,
      current_kindergarten: kg1,
    });
    await childRepo.save(childA);
    await wishlistRepo.save(
      wishlistRepo.create({ child: childA, target_kindergarten: kg2 }),
    );

    // 4. Create Child B in KG2, Wants KG3
    const childB = childRepo.create({
      name: 'Child B',
      birth_date: new Date('2020-01-01'),
      gender: Gender.FEMALE,
      group: AgeGroup.MLADJA,
      age_group: 3,
      parent: parent,
      current_kindergarten: kg2,
    });
    await childRepo.save(childB);
    await wishlistRepo.save(
      wishlistRepo.create({ child: childB, target_kindergarten: kg3 }),
    );

    // 5. Create Child C in KG3, Wants KG1
    const childC = childRepo.create({
      name: 'Child C',
      birth_date: new Date('2020-01-01'),
      gender: Gender.MALE,
      group: AgeGroup.MLADJA,
      age_group: 3,
      parent: parent,
      current_kindergarten: kg3,
    });
    await childRepo.save(childC);
    await wishlistRepo.save(
      wishlistRepo.create({ child: childC, target_kindergarten: kg1 }),
    );

    console.log(`State:
        Child A (in KG1) -> Wants KG2
        Child B (in KG2) -> Wants KG3
        Child C (in KG3) -> Wants KG1
        Expected Cycle: KG1 -> KG2 -> KG3 -> KG1`);

    // Test finding potential matches
    console.log('Finding all potential matches...');
    const potentialMatches = await matchingService.findPotentialMatches(
      AgeGroup.MLADJA,
    );

    console.log(`Found ${potentialMatches.length} potential matches.`);

    const circleMatch = potentialMatches.find(
      (m) =>
        m.children.length === 3 &&
        m.children.some((c) => c.id === childA.id) &&
        m.children.some((c) => c.id === childB.id) &&
        m.children.some((c) => c.id === childC.id),
    );

    if (circleMatch) {
      console.log('✅ SUCCESS: Found 3-way circle match!');
      console.log(
        'Children involved:',
        circleMatch.children.map((c) => c.name).join(', '),
      );
    } else {
      console.log('❌ FAILURE: Did not find 3-way circle match.');
    }

    // Cleanup
    console.log('Cleaning up...');
    await wishlistRepo.delete({ child: { id: childA.id } });
    await wishlistRepo.delete({ child: { id: childB.id } });
    await wishlistRepo.delete({ child: { id: childC.id } });
    await childRepo.remove([childA, childB, childC]);
    await userRepo.remove(parent);
    await kgRepo.remove([kg1, kg2, kg3]);
    console.log('Cleanup done.');
  } catch (error) {
    console.error('Error in verification:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

verifyCircleMatch();
