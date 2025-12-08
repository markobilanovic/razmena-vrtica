import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Child, AgeGroup } from '../../src/entities/child.entity';
import { Kindergarten } from '../../src/entities/kindergarten.entity';
import { User } from '../../src/entities/user.entity';
import { Wishlist } from '../../src/entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from '../../src/entities/match.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

describe('Auto-Matching Integration (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUser: User;

  // Repositories
  let userRepo: Repository<User>;
  let childRepo: Repository<Child>;
  let kindergartenRepo: Repository<Kindergarten>;
  let wishlistRepo: Repository<Wishlist>;
  let matchGroupRepo: Repository<MatchGroup>;
  let matchParticipantRepo: Repository<MatchParticipant>;

  // Test data
  let kindergartenA: Kindergarten;
  let kindergartenB: Kindergarten;
  let kindergartenC: Kindergarten;
  let kindergartenD: Kindergarten;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get repositories
    userRepo = app.get(getRepositoryToken(User));
    childRepo = app.get(getRepositoryToken(Child));
    kindergartenRepo = app.get(getRepositoryToken(Kindergarten));
    wishlistRepo = app.get(getRepositoryToken(Wishlist));
    matchGroupRepo = app.get(getRepositoryToken(MatchGroup));
    matchParticipantRepo = app.get(getRepositoryToken(MatchParticipant));

    // Create test user (or find existing one)
    const existingUser = await userRepo.findOne({
      where: { email: 'test@example.com' },
    });

    if (existingUser) {
      testUser = existingUser;
    } else {
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUser = await userRepo.save({
        email: 'test@example.com',
        password_hash: hashedPassword,
        full_name: 'Test User',
      });
    }

    // Login and get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    authToken = loginResponse.body.access_token;

    // Create test kindergartens (or find existing ones)
    kindergartenA =
      (await kindergartenRepo.findOne({ where: { email: 'kga@test.com' } })) ||
      (await kindergartenRepo.save({
        name: 'Kindergarten A',
        address: 'Address A',
        phone: '111-111-1111',
        email: 'kga@test.com',
      }));

    kindergartenB =
      (await kindergartenRepo.findOne({ where: { email: 'kgb@test.com' } })) ||
      (await kindergartenRepo.save({
        name: 'Kindergarten B',
        address: 'Address B',
        phone: '222-222-2222',
        email: 'kgb@test.com',
      }));

    kindergartenC =
      (await kindergartenRepo.findOne({ where: { email: 'kgc@test.com' } })) ||
      (await kindergartenRepo.save({
        name: 'Kindergarten C',
        address: 'Address C',
        phone: '333-333-3333',
        email: 'kgc@test.com',
      }));

    kindergartenD =
      (await kindergartenRepo.findOne({ where: { email: 'kgd@test.com' } })) ||
      (await kindergartenRepo.save({
        name: 'Kindergarten D',
        address: 'Address D',
        phone: '444-444-4444',
        email: 'kgd@test.com',
      }));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await matchParticipantRepo.delete({});
    await matchGroupRepo.delete({});
    await wishlistRepo.delete({});
    await childRepo.delete({});
    // Don't delete user or kindergartens as they're set up once
  });

  describe('Scenario 1: 2-Way Swap Auto-Creation', () => {
    it('should automatically create match when 2-way swap is detected', async () => {
      // 1. Create two children in same age group at different KGs
      const childA = await childRepo.save({
        first_name: 'Alice',
        last_name: 'Test',
        date_of_birth: new Date('2020-01-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenA.id,
        parent_id: testUser.id,
      });

      const childB = await childRepo.save({
        first_name: 'Bob',
        last_name: 'Test',
        date_of_birth: new Date('2020-02-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenB.id,
        parent_id: testUser.id,
      });

      // 2. Alice creates wishlist: wants to go to KG-B
      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childA.id,
          target_kindergarten_id: kindergartenB.id,
        })
        .expect(201);

      // 3. No match should exist yet
      let matches = await matchGroupRepo
        .createQueryBuilder('matchGroup')
        .leftJoinAndSelect('matchGroup.participants', 'participants')
        .where('participants.child_id = :childId', { childId: childA.id })
        .getMany();
      expect(matches).toHaveLength(0);

      // 4. Bob creates wishlist: wants to go to KG-A
      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childB.id,
          target_kindergarten_id: kindergartenA.id,
        })
        .expect(201);

      // 5. Wait for async matching to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 6. Match should now exist for both children
      matches = await matchGroupRepo
        .createQueryBuilder('matchGroup')
        .leftJoinAndSelect('matchGroup.participants', 'participants')
        .where('participants.child_id IN (:...childIds)', {
          childIds: [childA.id, childB.id],
        })
        .getMany();

      expect(matches).toHaveLength(1);
      expect(matches[0].status).toBe('PENDING_ACCEPTANCE');
      expect(matches[0].participants).toHaveLength(2);

      const participantIds = matches[0].participants
        .map((p) => p.child_id)
        .sort();
      expect(participantIds).toEqual([childA.id, childB.id].sort());
    });
  });

  describe('Scenario 2: 3-Way Cycle Auto-Creation', () => {
    it('should automatically create match when 3-way cycle is detected', async () => {
      // Create three children: A at KG-A, B at KG-B, C at KG-C
      const childA = await childRepo.save({
        first_name: 'Alice',
        last_name: 'Test',
        date_of_birth: new Date('2020-01-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenA.id,
        parent_id: testUser.id,
      });

      const childB = await childRepo.save({
        first_name: 'Bob',
        last_name: 'Test',
        date_of_birth: new Date('2020-02-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenB.id,
        parent_id: testUser.id,
      });

      const childC = await childRepo.save({
        first_name: 'Charlie',
        last_name: 'Test',
        date_of_birth: new Date('2020-03-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenC.id,
        parent_id: testUser.id,
      });

      // A wants B's KG
      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childA.id,
          target_kindergarten_id: kindergartenB.id,
        })
        .expect(201);

      // B wants C's KG
      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childB.id,
          target_kindergarten_id: kindergartenC.id,
        })
        .expect(201);

      // C wants A's KG - this completes the cycle
      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childC.id,
          target_kindergarten_id: kindergartenA.id,
        })
        .expect(201);

      // Wait for async matching
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify 3-way match was created
      const matches = await matchGroupRepo
        .createQueryBuilder('matchGroup')
        .leftJoinAndSelect('matchGroup.participants', 'participants')
        .where('participants.child_id IN (:...childIds)', {
          childIds: [childA.id, childB.id, childC.id],
        })
        .getMany();

      expect(matches.length).toBeGreaterThan(0);
      const threeWayMatch = matches.find((m) => m.participants.length === 3);
      expect(threeWayMatch).toBeDefined();
      expect(threeWayMatch!.status).toBe('PENDING_ACCEPTANCE');
    });
  });

  describe('Scenario 3: Age Group Boundary', () => {
    it('should NOT create match across different age groups', async () => {
      // Create children in different age groups
      const childA = await childRepo.save({
        first_name: 'Alice',
        last_name: 'Test',
        date_of_birth: new Date('2020-01-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenA.id,
        parent_id: testUser.id,
      });

      const childB = await childRepo.save({
        first_name: 'Bob',
        last_name: 'Test',
        date_of_birth: new Date('2019-01-01'),
        group: AgeGroup.SREDNJA,
        current_kindergarten_id: kindergartenB.id,
        parent_id: testUser.id,
      });

      // A (MLADJA) wants B's KG
      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childA.id,
          target_kindergarten_id: kindergartenB.id,
        })
        .expect(201);

      // B (SREDNJA) wants A's KG
      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childB.id,
          target_kindergarten_id: kindergartenA.id,
        })
        .expect(201);

      // Wait for async matching
      await new Promise((resolve) => setTimeout(resolve, 200));

      // No match should be created
      const matches = await matchGroupRepo
        .createQueryBuilder('matchGroup')
        .leftJoinAndSelect('matchGroup.participants', 'participants')
        .getMany();

      expect(matches).toHaveLength(0);
    });
  });

  describe('Scenario 4: Wishlist Update Triggers Re-Check', () => {
    it('should check for matches when wishlist is updated', async () => {
      const childA = await childRepo.save({
        first_name: 'Alice',
        last_name: 'Test',
        date_of_birth: new Date('2020-01-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenA.id,
        parent_id: testUser.id,
      });

      const childB = await childRepo.save({
        first_name: 'Bob',
        last_name: 'Test',
        date_of_birth: new Date('2020-02-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenB.id,
        parent_id: testUser.id,
      });

      // A initially wants KG-C (no match possible)
      const wishlistResponse = await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childA.id,
          target_kindergarten_id: kindergartenC.id,
        })
        .expect(201);

      const wishlistId = wishlistResponse.body.id;

      // B wants KG-A
      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childB.id,
          target_kindergarten_id: kindergartenA.id,
        })
        .expect(201);

      // Wait and verify no match
      await new Promise((resolve) => setTimeout(resolve, 200));
      let matches = await matchGroupRepo.find();
      expect(matches).toHaveLength(0);

      // A updates wishlist to want KG-B (now match is possible)
      await request(app.getHttpServer())
        .put(`/wishlists/${wishlistId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          target_kindergarten_id: kindergartenB.id,
        })
        .expect(200);

      // Wait for async matching
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Match should now exist
      matches = await matchGroupRepo
        .createQueryBuilder('matchGroup')
        .leftJoinAndSelect('matchGroup.participants', 'participants')
        .getMany();

      expect(matches.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario 5: Duplicate Match Prevention', () => {
    it('should not create duplicate matches', async () => {
      const childA = await childRepo.save({
        first_name: 'Alice',
        last_name: 'Test',
        date_of_birth: new Date('2020-01-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenA.id,
        parent_id: testUser.id,
      });

      const childB = await childRepo.save({
        first_name: 'Bob',
        last_name: 'Test',
        date_of_birth: new Date('2020-02-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenB.id,
        parent_id: testUser.id,
      });

      // Create wishlists (creates match)
      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childA.id,
          target_kindergarten_id: kindergartenB.id,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childB.id,
          target_kindergarten_id: kindergartenA.id,
        })
        .expect(201);

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Count matches
      let matchCount = await matchGroupRepo.count();
      expect(matchCount).toBe(1);

      // Trigger matching again by adding another wishlist for A
      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childA.id,
          target_kindergarten_id: kindergartenC.id,
        })
        .expect(201);

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should still only have 1 match
      matchCount = await matchGroupRepo.count();
      expect(matchCount).toBe(1);
    });
  });

  describe('Scenario 6: Multiple Matches for One Child', () => {
    it('should handle child being in multiple potential matches', async () => {
      // A at KG-A wants both KG-B and KG-C
      const childA = await childRepo.save({
        first_name: 'Alice',
        last_name: 'Test',
        date_of_birth: new Date('2020-01-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenA.id,
        parent_id: testUser.id,
      });

      // B at KG-B wants KG-A
      const childB = await childRepo.save({
        first_name: 'Bob',
        last_name: 'Test',
        date_of_birth: new Date('2020-02-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenB.id,
        parent_id: testUser.id,
      });

      // C at KG-C wants KG-A
      const childC = await childRepo.save({
        first_name: 'Charlie',
        last_name: 'Test',
        date_of_birth: new Date('2020-03-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenC.id,
        parent_id: testUser.id,
      });

      // Create wishlists
      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childA.id,
          target_kindergarten_id: kindergartenB.id,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childA.id,
          target_kindergarten_id: kindergartenC.id,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childB.id,
          target_kindergarten_id: kindergartenA.id,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childC.id,
          target_kindergarten_id: kindergartenA.id,
        })
        .expect(201);

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should create two separate 2-way matches
      const matches = await matchGroupRepo
        .createQueryBuilder('matchGroup')
        .leftJoinAndSelect('matchGroup.participants', 'participants')
        .getMany();

      // Child A should be in multiple matches
      const matchesWithA = matches.filter((m) =>
        m.participants.some((p) => p.child_id === childA.id),
      );

      expect(matchesWithA.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Scenario 7: Wishlist Deletion', () => {
    it('should handle wishlist deletion gracefully', async () => {
      const childA = await childRepo.save({
        first_name: 'Alice',
        last_name: 'Test',
        date_of_birth: new Date('2020-01-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenA.id,
        parent_id: testUser.id,
      });

      const childB = await childRepo.save({
        first_name: 'Bob',
        last_name: 'Test',
        date_of_birth: new Date('2020-02-01'),
        group: AgeGroup.MLADJA,
        current_kindergarten_id: kindergartenB.id,
        parent_id: testUser.id,
      });

      // Create wishlists and match
      const wishlistResponse = await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childA.id,
          target_kindergarten_id: kindergartenB.id,
        })
        .expect(201);

      const wishlistId = wishlistResponse.body.id;

      await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_id: childB.id,
          target_kindergarten_id: kindergartenA.id,
        })
        .expect(201);

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify match exists
      let matchCount = await matchGroupRepo.count();
      expect(matchCount).toBe(1);

      // Delete A's wishlist
      await request(app.getHttpServer())
        .delete(`/wishlists/${wishlistId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Wishlist should be deleted
      const wishlistCount = await wishlistRepo.count({
        where: { id: wishlistId },
      });
      expect(wishlistCount).toBe(0);
    });
  });
});
