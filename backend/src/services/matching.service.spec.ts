import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchingService } from './matching.service';
import { Child, AgeGroup } from '../entities/child.entity';
import { Wishlist } from '../entities/wishlist.entity';
import {
  MatchGroup,
  MatchParticipant,
  MatchStatus,
} from '../entities/match.entity';
import { HiddenMatch } from '../entities/hidden-match.entity';
import {
  mockChild,
  mockWishlist,
  mockKindergarten,
  mockMatchGroup,
  mockMatchParticipant,
  MockType,
} from '../../test/helpers/mock-data.factory';

describe('MatchingService', () => {
  let service: MatchingService;
  let childRepo: MockType<Repository<Child>>;
  let wishlistRepo: MockType<Repository<Wishlist>>;
  let matchGroupRepo: any;
  let matchParticipantRepo: MockType<Repository<MatchParticipant>>;
  let hiddenMatchRepo: MockType<Repository<HiddenMatch>>;

  const mockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    findByIds: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        {
          provide: getRepositoryToken(Child),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Wishlist),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(MatchGroup),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(MatchParticipant),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(HiddenMatch),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
    childRepo = module.get(getRepositoryToken(Child));
    wishlistRepo = module.get(getRepositoryToken(Wishlist));
    matchGroupRepo = module.get(getRepositoryToken(MatchGroup));
    matchParticipantRepo = module.get(getRepositoryToken(MatchParticipant));
    hiddenMatchRepo = module.get(getRepositoryToken(HiddenMatch));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMatch()', () => {
    it('should create match for 2 children', async () => {
      const childA = mockChild({ id: 'child-a', group: AgeGroup.MLADJA });
      const childB = mockChild({ id: 'child-b', group: AgeGroup.MLADJA });
      const matchGroup = mockMatchGroup({ id: 'match-1' });

      childRepo.findByIds.mockResolvedValue([childA, childB]);
      matchGroupRepo.create.mockReturnValue(matchGroup);
      matchGroupRepo.save.mockResolvedValue(matchGroup);
      matchParticipantRepo.create.mockImplementation((data) => data);
      matchParticipantRepo.save.mockResolvedValue([]);

      const result = await service.createMatch(['child-a', 'child-b']);

      expect(result).toEqual(matchGroup);
      expect(childRepo.findByIds).toHaveBeenCalledWith(['child-a', 'child-b']);
      expect(matchGroupRepo.create).toHaveBeenCalledWith({
        status: MatchStatus.PENDING_ACCEPTANCE,
      });
      expect(matchParticipantRepo.save).toHaveBeenCalled();
    });

    it('should throw error when less than 2 children', async () => {
      await expect(service.createMatch(['child-1'])).rejects.toThrow(
        'At least 2 children are required to create a match',
      );
    });

    it('should throw error when some children not found', async () => {
      childRepo.findByIds.mockResolvedValue([mockChild({ id: 'child-a' })]);

      await expect(service.createMatch(['child-a', 'child-b'])).rejects.toThrow(
        'Some children were not found',
      );
    });

    it('should throw error when children in different age groups', async () => {
      const childA = mockChild({ id: 'child-a', group: AgeGroup.MLADJA });
      const childB = mockChild({ id: 'child-b', group: AgeGroup.SREDNJA });

      childRepo.findByIds.mockResolvedValue([childA, childB]);

      await expect(service.createMatch(['child-a', 'child-b'])).rejects.toThrow(
        /Cannot create match: children must be in the same age group/,
      );
    });

    it('should throw error when some children have no age group', async () => {
      const childA = mockChild({ id: 'child-a', group: AgeGroup.MLADJA });
      const childB = mockChild({ id: 'child-b', group: null });

      childRepo.findByIds.mockResolvedValue([childA, childB]);

      await expect(service.createMatch(['child-a', 'child-b'])).rejects.toThrow(
        /Cannot create match/,
      );
    });

    it('should set initial status to PENDING_ACCEPTANCE', async () => {
      const childA = mockChild({ id: 'child-a', group: AgeGroup.MLADJA });
      const childB = mockChild({ id: 'child-b', group: AgeGroup.MLADJA });
      const matchGroup = mockMatchGroup();

      childRepo.findByIds.mockResolvedValue([childA, childB]);
      matchGroupRepo.create.mockReturnValue(matchGroup);
      matchGroupRepo.save.mockResolvedValue(matchGroup);
      matchParticipantRepo.create.mockImplementation((data) => data);
      matchParticipantRepo.save.mockResolvedValue([]);

      await service.createMatch(['child-a', 'child-b']);

      expect(matchGroupRepo.create).toHaveBeenCalledWith({
        status: MatchStatus.PENDING_ACCEPTANCE,
      });
    });

    it('should create participants in circular order', async () => {
      const childA = mockChild({ id: 'child-a', group: AgeGroup.MLADJA });
      const childB = mockChild({ id: 'child-b', group: AgeGroup.MLADJA });
      const childC = mockChild({ id: 'child-c', group: AgeGroup.MLADJA });
      const matchGroup = mockMatchGroup({ id: 'match-1' });

      childRepo.findByIds.mockResolvedValue([childA, childB, childC]);
      matchGroupRepo.create.mockReturnValue(matchGroup);
      matchGroupRepo.save.mockResolvedValue(matchGroup);
      matchParticipantRepo.create.mockImplementation((data) => data);
      matchParticipantRepo.save.mockResolvedValue([]);

      await service.createMatch(['child-a', 'child-b', 'child-c']);

      const createCalls = matchParticipantRepo.create.mock.calls;
      expect(createCalls).toHaveLength(3);

      // Verify circular order: A->B, B->C, C->A
      expect(createCalls[0][0]).toMatchObject({
        child_id: 'child-a',
        next_child_id: 'child-b',
      });
      expect(createCalls[1][0]).toMatchObject({
        child_id: 'child-b',
        next_child_id: 'child-c',
      });
      expect(createCalls[2][0]).toMatchObject({
        child_id: 'child-c',
        next_child_id: 'child-a',
      });
    });
  });

  describe('checkAndCreateMatchesForChild()', () => {
    it('should return empty array when child not found', async () => {
      childRepo.findOne.mockResolvedValue(null);

      const result = await service.checkAndCreateMatchesForChild('child-1');

      expect(result).toEqual([]);
    });

    it('should return empty array when child has no age group', async () => {
      const child = mockChild({ id: 'child-1', group: null });
      childRepo.findOne.mockResolvedValue(child);

      const result = await service.checkAndCreateMatchesForChild('child-1');

      expect(result).toEqual([]);
    });

    it('should create match for 2-way swap', async () => {
      // Child A at KG-1 wants KG-2
      const childA = mockChild({
        id: 'child-a',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-1',
        wishlists: [
          mockWishlist({
            child_id: 'child-a',
            target_kindergarten_id: 'kg-2',
          }),
        ],
      });

      // Child B at KG-2 wants KG-1
      const childB = mockChild({
        id: 'child-b',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-2',
        wishlists: [
          mockWishlist({
            child_id: 'child-b',
            target_kindergarten_id: 'kg-1',
          }),
        ],
      });

      const matchGroup = mockMatchGroup();

      childRepo.findOne.mockResolvedValue(childA);

      // Mock query builder for findPotentialMatches
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([childA, childB]),
      };
      childRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock findExistingMatch to return null
      const mockMatchQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      matchGroupRepo.createQueryBuilder.mockReturnValue(mockMatchQueryBuilder);

      // Mock createMatch
      childRepo.findByIds.mockResolvedValue([childA, childB]);
      matchGroupRepo.create.mockReturnValue(matchGroup);
      matchGroupRepo.save.mockResolvedValue(matchGroup);
      matchParticipantRepo.create.mockImplementation((data) => data);
      matchParticipantRepo.save.mockResolvedValue([]);

      const result = await service.checkAndCreateMatchesForChild('child-a');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(matchGroup);
    });

    it('should not create duplicate matches', async () => {
      const childA = mockChild({
        id: 'child-a',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-1',
        wishlists: [
          mockWishlist({
            child_id: 'child-a',
            target_kindergarten_id: 'kg-2',
          }),
        ],
      });

      const childB = mockChild({
        id: 'child-b',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-2',
        wishlists: [
          mockWishlist({
            child_id: 'child-b',
            target_kindergarten_id: 'kg-1',
          }),
        ],
      });

      // Existing match
      const existingMatch = mockMatchGroup({
        id: 'existing-match',
        participants: [
          mockMatchParticipant({ child_id: 'child-a' }),
          mockMatchParticipant({ child_id: 'child-b' }),
        ],
      });

      childRepo.findOne.mockResolvedValue(childA);

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([childA, childB]),
      };
      childRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock findExistingMatch to return existing match
      const mockMatchQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([existingMatch]),
      };
      matchGroupRepo.createQueryBuilder.mockReturnValue(mockMatchQueryBuilder);

      const result = await service.checkAndCreateMatchesForChild('child-a');

      expect(result).toEqual([]);
      expect(matchGroupRepo.create).not.toHaveBeenCalled();
    });

    it('should only match children in same age group', async () => {
      const childA = mockChild({
        id: 'child-a',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-1',
        wishlists: [
          mockWishlist({
            child_id: 'child-a',
            target_kindergarten_id: 'kg-2',
          }),
        ],
      });

      // Child B in different age group
      const childB = mockChild({
        id: 'child-b',
        group: AgeGroup.SREDNJA,
        current_kindergarten_id: 'kg-2',
        wishlists: [
          mockWishlist({
            child_id: 'child-b',
            target_kindergarten_id: 'kg-1',
          }),
        ],
      });

      childRepo.findOne.mockResolvedValue(childA);

      // Only return childA from query (age group filtered)
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([childA]),
      };
      childRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.checkAndCreateMatchesForChild('child-a');

      expect(result).toEqual([]);
    });
  });

  describe('findPotentialMatches()', () => {
    it('should find 2-way swap cycles', async () => {
      const childA = mockChild({
        id: 'child-a',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-1',
        wishlists: [
          mockWishlist({
            child_id: 'child-a',
            target_kindergarten_id: 'kg-2',
          }),
        ],
      });

      const childB = mockChild({
        id: 'child-b',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-2',
        wishlists: [
          mockWishlist({
            child_id: 'child-b',
            target_kindergarten_id: 'kg-1',
          }),
        ],
      });

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([childA, childB]),
      };
      childRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findPotentialMatches(AgeGroup.MLADJA);

      expect(result.length).toBeGreaterThan(0);
      const match = result[0];
      expect(match.children).toHaveLength(2);
    });

    it('should find 3-way swap cycles', async () => {
      const childA = mockChild({
        id: 'child-a',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-1',
        wishlists: [
          mockWishlist({
            child_id: 'child-a',
            target_kindergarten_id: 'kg-2',
          }),
        ],
      });

      const childB = mockChild({
        id: 'child-b',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-2',
        wishlists: [
          mockWishlist({
            child_id: 'child-b',
            target_kindergarten_id: 'kg-3',
          }),
        ],
      });

      const childC = mockChild({
        id: 'child-c',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-3',
        wishlists: [
          mockWishlist({
            child_id: 'child-c',
            target_kindergarten_id: 'kg-1',
          }),
        ],
      });

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([childA, childB, childC]),
      };
      childRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findPotentialMatches(AgeGroup.MLADJA);

      expect(result.length).toBeGreaterThan(0);
      const match = result.find((m) => m.children.length === 3);
      expect(match).toBeDefined();
    });

    it('should return empty array when no cycles exist', async () => {
      const childA = mockChild({
        id: 'child-a',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-1',
        wishlists: [
          mockWishlist({
            child_id: 'child-a',
            target_kindergarten_id: 'kg-2',
          }),
        ],
      });

      // Child B wants a different KG (no cycle)
      const childB = mockChild({
        id: 'child-b',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-2',
        wishlists: [
          mockWishlist({
            child_id: 'child-b',
            target_kindergarten_id: 'kg-3',
          }),
        ],
      });

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([childA, childB]),
      };
      childRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findPotentialMatches(AgeGroup.MLADJA);

      expect(result).toEqual([]);
    });

    it('should group children by age group', async () => {
      const childA = mockChild({
        id: 'child-a',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-1',
        wishlists: [
          mockWishlist({
            child_id: 'child-a',
            target_kindergarten_id: 'kg-2',
          }),
        ],
      });

      const childB = mockChild({
        id: 'child-b',
        group: AgeGroup.SREDNJA,
        current_kindergarten_id: 'kg-3',
        wishlists: [
          mockWishlist({
            child_id: 'child-b',
            target_kindergarten_id: 'kg-4',
          }),
        ],
      });

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([childA, childB]),
      };
      childRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findPotentialMatches();

      // Each match should only contain children from one age group
      for (const match of result) {
        const ageGroups = new Set(match.children.map((c) => c.group));
        expect(ageGroups.size).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('checkAndCreateMatchesForAgeGroup()', () => {
    it('should create multiple matches in age group', async () => {
      // Two separate 2-way swaps
      const childA = mockChild({
        id: 'child-a',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-1',
        wishlists: [mockWishlist({ target_kindergarten_id: 'kg-2' })],
      });

      const childB = mockChild({
        id: 'child-b',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-2',
        wishlists: [mockWishlist({ target_kindergarten_id: 'kg-1' })],
      });

      const childC = mockChild({
        id: 'child-c',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-3',
        wishlists: [mockWishlist({ target_kindergarten_id: 'kg-4' })],
      });

      const childD = mockChild({
        id: 'child-d',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-4',
        wishlists: [mockWishlist({ target_kindergarten_id: 'kg-3' })],
      });

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([childA, childB, childC, childD]),
      };
      childRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const mockMatchQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      matchGroupRepo.createQueryBuilder.mockReturnValue(mockMatchQueryBuilder);

      childRepo.findByIds.mockImplementation((ids) =>
        Promise.resolve(
          [childA, childB, childC, childD].filter((c) => ids.includes(c.id)),
        ),
      );
      matchGroupRepo.create.mockReturnValue(mockMatchGroup());
      matchGroupRepo.save.mockResolvedValue(mockMatchGroup());
      matchParticipantRepo.create.mockImplementation((data) => data);
      matchParticipantRepo.save.mockResolvedValue([]);

      const result = await service.checkAndCreateMatchesForAgeGroup(
        AgeGroup.MLADJA,
      );

      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('validateMatchAgeGroup()', () => {
    it('should return true when all children in same age group', async () => {
      const match = mockMatchGroup({
        id: 'match-1',
        participants: [
          mockMatchParticipant({
            child: mockChild({ group: AgeGroup.MLADJA }),
          }),
          mockMatchParticipant({
            child: mockChild({ group: AgeGroup.MLADJA }),
          }),
        ],
      });

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(match),
      };
      matchGroupRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.validateMatchAgeGroup('match-1');

      expect(result).toBe(true);
    });

    it('should return false when children in different age groups', async () => {
      const match = mockMatchGroup({
        id: 'match-1',
        participants: [
          mockMatchParticipant({
            child: mockChild({ group: AgeGroup.MLADJA }),
          }),
          mockMatchParticipant({
            child: mockChild({ group: AgeGroup.SREDNJA }),
          }),
        ],
      });

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(match),
      };
      matchGroupRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.validateMatchAgeGroup('match-1');

      expect(result).toBe(false);
    });

    it('should return false when match not found', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      matchGroupRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.validateMatchAgeGroup('match-1');

      expect(result).toBe(false);
    });
  });

  describe('validateAndCleanupMatchesForChild()', () => {
    it('should cancel matches when child no longer wants required swap', async () => {
      const child = mockChild({
        id: 'child-a',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-1',
        wishlists: [
          // Child now wants kg-3, but match requires them to go to kg-2
          mockWishlist({ target_kindergarten_id: 'kg-3' }),
        ],
      });

      const nextChild = mockChild({
        id: 'child-b',
        current_kindergarten_id: 'kg-2',
      });

      const matchGroup = mockMatchGroup({
        id: 'match-1',
        status: MatchStatus.PENDING_ACCEPTANCE,
        participants: [
          mockMatchParticipant({
            child_id: 'child-a',
            next_child: nextChild,
          }),
        ],
      });

      childRepo.findOne.mockResolvedValue(child);

      const mockFindMatchesQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([matchGroup]),
      };
      matchGroupRepo.createQueryBuilder.mockReturnValue(
        mockFindMatchesQueryBuilder,
      );
      matchGroupRepo.save.mockResolvedValue(matchGroup);

      await service.validateAndCleanupMatchesForChild('child-a');

      expect(matchGroupRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: MatchStatus.CANCELLED,
        }),
      );
    });

    it('should not cancel matches when child still wants required swap', async () => {
      const child = mockChild({
        id: 'child-a',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-1',
        wishlists: [
          // Child still wants kg-2, which matches the required swap
          mockWishlist({ target_kindergarten_id: 'kg-2' }),
        ],
      });

      const nextChild = mockChild({
        id: 'child-b',
        current_kindergarten_id: 'kg-2',
      });

      const matchGroup = mockMatchGroup({
        id: 'match-1',
        status: MatchStatus.PENDING_ACCEPTANCE,
        participants: [
          mockMatchParticipant({
            child_id: 'child-a',
            next_child: nextChild,
          }),
        ],
      });

      childRepo.findOne.mockResolvedValue(child);

      const mockFindMatchesQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([matchGroup]),
      };
      matchGroupRepo.createQueryBuilder.mockReturnValue(
        mockFindMatchesQueryBuilder,
      );

      await service.validateAndCleanupMatchesForChild('child-a');

      expect(matchGroupRepo.save).not.toHaveBeenCalled();
    });

    it('should not affect completed or cancelled matches', async () => {
      const child = mockChild({
        id: 'child-a',
        group: AgeGroup.MLADJA,
        current_kindergarten_id: 'kg-1',
        wishlists: [],
      });

      const completedMatch = mockMatchGroup({
        id: 'match-1',
        status: MatchStatus.COMPLETED,
      });

      const cancelledMatch = mockMatchGroup({
        id: 'match-2',
        status: MatchStatus.CANCELLED,
      });

      childRepo.findOne.mockResolvedValue(child);

      const mockFindMatchesQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([completedMatch, cancelledMatch]),
      };
      matchGroupRepo.createQueryBuilder.mockReturnValue(
        mockFindMatchesQueryBuilder,
      );

      await service.validateAndCleanupMatchesForChild('child-a');

      expect(matchGroupRepo.save).not.toHaveBeenCalled();
    });

    it('should handle child not found gracefully', async () => {
      childRepo.findOne.mockResolvedValue(null);

      await expect(
        service.validateAndCleanupMatchesForChild('non-existent-child'),
      ).resolves.not.toThrow();

      expect(matchGroupRepo.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('Hide functionality', () => {
    describe('hideMatchForUser()', () => {
      it('should create hidden match record when not already hidden', async () => {
        hiddenMatchRepo.findOne.mockResolvedValue(null);
        hiddenMatchRepo.create.mockReturnValue({
          id: 'hidden-1',
          user_id: 'user-1',
          match_group_id: 'match-1',
        });
        hiddenMatchRepo.save.mockResolvedValue({ id: 'hidden-1' });

        await service.hideMatchForUser('user-1', 'match-1');

        expect(hiddenMatchRepo.findOne).toHaveBeenCalledWith({
          where: { user_id: 'user-1', match_group_id: 'match-1' },
        });
        expect(hiddenMatchRepo.create).toHaveBeenCalledWith({
          user_id: 'user-1',
          match_group_id: 'match-1',
        });
        expect(hiddenMatchRepo.save).toHaveBeenCalled();
      });

      it('should be idempotent when match already hidden', async () => {
        hiddenMatchRepo.findOne.mockResolvedValue({ id: 'existing-hidden' });

        await service.hideMatchForUser('user-1', 'match-1');

        expect(hiddenMatchRepo.create).not.toHaveBeenCalled();
        expect(hiddenMatchRepo.save).not.toHaveBeenCalled();
      });
    });

    describe('unhideMatchForUser()', () => {
      it('should delete hidden match record', async () => {
        hiddenMatchRepo.delete.mockResolvedValue({ affected: 1 });

        await service.unhideMatchForUser('user-1', 'match-1');

        expect(hiddenMatchRepo.delete).toHaveBeenCalledWith({
          user_id: 'user-1',
          match_group_id: 'match-1',
        });
      });
    });

    describe('isMatchHiddenForUser()', () => {
      it('should return true when match is hidden', async () => {
        hiddenMatchRepo.findOne.mockResolvedValue({ id: 'hidden-1' });

        const result = await service.isMatchHiddenForUser('user-1', 'match-1');

        expect(result).toBe(true);
        expect(hiddenMatchRepo.findOne).toHaveBeenCalledWith({
          where: { user_id: 'user-1', match_group_id: 'match-1' },
        });
      });

      it('should return false when match is not hidden', async () => {
        hiddenMatchRepo.findOne.mockResolvedValue(null);

        const result = await service.isMatchHiddenForUser('user-1', 'match-1');

        expect(result).toBe(false);
      });
    });

    describe('getVisibleMatchesForUser()', () => {
      it('should filter out hidden matches', async () => {
        const match1 = mockMatchGroup({ id: 'match-1' });
        const match2 = mockMatchGroup({ id: 'match-2' });
        const match3 = mockMatchGroup({ id: 'match-3' });

        // Mock findMatchGroupsForChild to return all matches
        const mockFindMatchesQueryBuilder = {
          innerJoin: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([match1, match2, match3]),
        };
        matchGroupRepo.createQueryBuilder.mockReturnValue(
          mockFindMatchesQueryBuilder,
        );

        // Mock hidden matches - user has hidden match-2
        hiddenMatchRepo.find.mockResolvedValue([{ match_group_id: 'match-2' }]);

        const result = await service.getVisibleMatchesForUser(
          'user-1',
          'child-1',
        );

        expect(result).toHaveLength(2);
        expect(result.map((m) => m.id)).toEqual(['match-1', 'match-3']);
        expect(hiddenMatchRepo.find).toHaveBeenCalledWith({
          where: { user_id: 'user-1' },
          select: ['match_group_id'],
        });
      });

      it('should return all matches when none are hidden', async () => {
        const match1 = mockMatchGroup({ id: 'match-1' });
        const match2 = mockMatchGroup({ id: 'match-2' });

        const mockFindMatchesQueryBuilder = {
          innerJoin: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([match1, match2]),
        };
        matchGroupRepo.createQueryBuilder.mockReturnValue(
          mockFindMatchesQueryBuilder,
        );

        hiddenMatchRepo.find.mockResolvedValue([]);

        const result = await service.getVisibleMatchesForUser(
          'user-1',
          'child-1',
        );

        expect(result).toHaveLength(2);
        expect(result.map((m) => m.id)).toEqual(['match-1', 'match-2']);
      });
    });
  });
});
