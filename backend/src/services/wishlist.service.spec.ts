import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistService } from './wishlist.service';
import { MatchingService } from './matching.service';
import { Wishlist } from '../entities/wishlist.entity';
import { Child, AgeGroup } from '../entities/child.entity';
import { Kindergarten } from '../entities/kindergarten.entity';
import {
  mockChild,
  mockWishlist,
  mockKindergarten,
  MockType,
} from '../../test/helpers/mock-data.factory';

describe('WishlistService', () => {
  let service: WishlistService;
  let wishlistRepo: MockType<Repository<Wishlist>>;
  let childRepo: MockType<Repository<Child>>;
  let kindergartenRepo: MockType<Repository<Kindergarten>>;
  let matchingService: MockType<MatchingService>;

  // Mock repository factory
  const mockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: getRepositoryToken(Wishlist),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Child),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Kindergarten),
          useFactory: mockRepository,
        },
        {
          provide: MatchingService,
          useValue: {
            checkAndCreateMatchesForChild: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    wishlistRepo = module.get(getRepositoryToken(Wishlist));
    childRepo = module.get(getRepositoryToken(Child));
    kindergartenRepo = module.get(getRepositoryToken(Kindergarten));
    matchingService = module.get(MatchingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const createDto = {
      child_id: 'child-1',
      target_kindergarten_id: 'kg-2',
    };

    it('should successfully create wishlist', async () => {
      const child = mockChild({ id: 'child-1' });
      const kindergarten = mockKindergarten({ id: 'kg-2' });
      const wishlist = mockWishlist(createDto);

      childRepo.findOne.mockResolvedValue(child);
      kindergartenRepo.findOne.mockResolvedValue(kindergarten);
      wishlistRepo.findOne.mockResolvedValue(null); // No existing wishlist
      wishlistRepo.create.mockReturnValue(wishlist);
      wishlistRepo.save.mockResolvedValue(wishlist);

      const result = await service.create(createDto);

      expect(result).toEqual(wishlist);
      expect(childRepo.findOne).toHaveBeenCalledWith({
        where: { id: createDto.child_id },
      });
      expect(kindergartenRepo.findOne).toHaveBeenCalledWith({
        where: { id: createDto.target_kindergarten_id },
      });
      expect(wishlistRepo.create).toHaveBeenCalledWith(createDto);
      expect(wishlistRepo.save).toHaveBeenCalledWith(wishlist);
    });

    it('should throw error when child not found', async () => {
      childRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow('Child not found');
      expect(kindergartenRepo.findOne).not.toHaveBeenCalled();
      expect(wishlistRepo.create).not.toHaveBeenCalled();
    });

    it('should throw error when kindergarten not found', async () => {
      const child = mockChild({ id: 'child-1' });
      childRepo.findOne.mockResolvedValue(child);
      kindergartenRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        'Target kindergarten not found',
      );
      expect(wishlistRepo.create).not.toHaveBeenCalled();
    });

    it('should throw error when duplicate wishlist exists', async () => {
      const child = mockChild({ id: 'child-1' });
      const kindergarten = mockKindergarten({ id: 'kg-2' });
      const existingWishlist = mockWishlist(createDto);

      childRepo.findOne.mockResolvedValue(child);
      kindergartenRepo.findOne.mockResolvedValue(kindergarten);
      wishlistRepo.findOne.mockResolvedValue(existingWishlist);

      await expect(service.create(createDto)).rejects.toThrow(
        'Wishlist already exists',
      );
      expect(wishlistRepo.create).not.toHaveBeenCalled();
    });

    it('should call MatchingService after creation', async () => {
      const child = mockChild({ id: 'child-1' });
      const kindergarten = mockKindergarten({ id: 'kg-2' });
      const wishlist = mockWishlist(createDto);

      childRepo.findOne.mockResolvedValue(child);
      kindergartenRepo.findOne.mockResolvedValue(kindergarten);
      wishlistRepo.findOne.mockResolvedValue(null);
      wishlistRepo.create.mockReturnValue(wishlist);
      wishlistRepo.save.mockResolvedValue(wishlist);

      await service.create(createDto);

      expect(matchingService.checkAndCreateMatchesForChild).toHaveBeenCalledWith(
        createDto.child_id,
      );
    });

    it('should create wishlist even if matching fails', async () => {
      const child = mockChild({ id: 'child-1' });
      const kindergarten = mockKindergarten({ id: 'kg-2' });
      const wishlist = mockWishlist(createDto);

      childRepo.findOne.mockResolvedValue(child);
      kindergartenRepo.findOne.mockResolvedValue(kindergarten);
      wishlistRepo.findOne.mockResolvedValue(null);
      wishlistRepo.create.mockReturnValue(wishlist);
      wishlistRepo.save.mockResolvedValue(wishlist);

      // Mock matching service to fail
      matchingService.checkAndCreateMatchesForChild.mockRejectedValue(
        new Error('Matching failed'),
      );

      const result = await service.create(createDto);

      expect(result).toEqual(wishlist);
      expect(wishlistRepo.save).toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    const updateDto = {
      target_kindergarten_id: 'kg-3',
    };

    it('should successfully update wishlist', async () => {
      const existingWishlist = mockWishlist({
        id: 'wishlist-1',
        child_id: 'child-1',
        target_kindergarten_id: 'kg-2',
      });
      const kindergarten = mockKindergarten({ id: 'kg-3' });
      const updatedWishlist = { ...existingWishlist, ...updateDto };

      wishlistRepo.findOne.mockResolvedValue(existingWishlist);
      kindergartenRepo.findOne.mockResolvedValue(kindergarten);
      wishlistRepo.save.mockResolvedValue(updatedWishlist);

      const result = await service.update('wishlist-1', updateDto);

      expect(result).toEqual(updatedWishlist);
      expect(kindergartenRepo.findOne).toHaveBeenCalledWith({
        where: { id: updateDto.target_kindergarten_id },
      });
      expect(wishlistRepo.save).toHaveBeenCalled();
    });

    it('should throw error when wishlist not found', async () => {
      wishlistRepo.findOne.mockResolvedValue(null);

      await expect(service.update('wishlist-1', updateDto)).rejects.toThrow(
        'Wishlist not found',
      );
      expect(kindergartenRepo.findOne).not.toHaveBeenCalled();
    });

    it('should throw error when new kindergarten not found', async () => {
      const existingWishlist = mockWishlist({
        id: 'wishlist-1',
        child_id: 'child-1',
      });
      wishlistRepo.findOne.mockResolvedValue(existingWishlist);
      kindergartenRepo.findOne.mockResolvedValue(null);

      await expect(service.update('wishlist-1', updateDto)).rejects.toThrow(
        'Target kindergarten not found',
      );
      expect(wishlistRepo.save).not.toHaveBeenCalled();
    });

    it('should call MatchingService after update', async () => {
      const existingWishlist = mockWishlist({
        id: 'wishlist-1',
        child_id: 'child-1',
      });
      const kindergarten = mockKindergarten({ id: 'kg-3' });

      wishlistRepo.findOne.mockResolvedValue(existingWishlist);
      kindergartenRepo.findOne.mockResolvedValue(kindergarten);
      wishlistRepo.save.mockResolvedValue(existingWishlist);

      await service.update('wishlist-1', updateDto);

      expect(matchingService.checkAndCreateMatchesForChild).toHaveBeenCalledWith(
        existingWishlist.child_id,
      );
    });

    it('should update wishlist even if matching fails', async () => {
      const existingWishlist = mockWishlist({
        id: 'wishlist-1',
        child_id: 'child-1',
      });
      const kindergarten = mockKindergarten({ id: 'kg-3' });
      const updatedWishlist = { ...existingWishlist, ...updateDto };

      wishlistRepo.findOne.mockResolvedValue(existingWishlist);
      kindergartenRepo.findOne.mockResolvedValue(kindergarten);
      wishlistRepo.save.mockResolvedValue(updatedWishlist);

      // Mock matching service to fail
      matchingService.checkAndCreateMatchesForChild.mockRejectedValue(
        new Error('Matching failed'),
      );

      const result = await service.update('wishlist-1', updateDto);

      expect(result).toEqual(updatedWishlist);
      expect(wishlistRepo.save).toHaveBeenCalled();
    });
  });

  describe('delete()', () => {
    it('should successfully delete wishlist', async () => {
      const wishlist = mockWishlist({
        id: 'wishlist-1',
        child_id: 'child-1',
      });

      wishlistRepo.findOne.mockResolvedValue(wishlist);
      wishlistRepo.remove.mockResolvedValue(wishlist);

      await service.delete('wishlist-1');

      expect(wishlistRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'wishlist-1' },
      });
      expect(wishlistRepo.remove).toHaveBeenCalledWith(wishlist);
    });

    it('should throw error when wishlist not found', async () => {
      wishlistRepo.findOne.mockResolvedValue(null);

      await expect(service.delete('wishlist-1')).rejects.toThrow(
        'Wishlist not found',
      );
      expect(wishlistRepo.remove).not.toHaveBeenCalled();
    });

    it('should call MatchingService after deletion', async () => {
      const wishlist = mockWishlist({
        id: 'wishlist-1',
        child_id: 'child-1',
      });

      wishlistRepo.findOne.mockResolvedValue(wishlist);
      wishlistRepo.remove.mockResolvedValue(wishlist);

      await service.delete('wishlist-1');

      expect(matchingService.checkAndCreateMatchesForChild).toHaveBeenCalledWith(
        wishlist.child_id,
      );
    });

    it('should delete wishlist even if matching fails', async () => {
      const wishlist = mockWishlist({
        id: 'wishlist-1',
        child_id: 'child-1',
      });

      wishlistRepo.findOne.mockResolvedValue(wishlist);
      wishlistRepo.remove.mockResolvedValue(wishlist);

      // Mock matching service to fail
      matchingService.checkAndCreateMatchesForChild.mockRejectedValue(
        new Error('Matching failed'),
      );

      await service.delete('wishlist-1');

      expect(wishlistRepo.remove).toHaveBeenCalledWith(wishlist);
    });
  });

  describe('findByChild()', () => {
    it('should return wishlists for given child', async () => {
      const wishlists = [
        mockWishlist({ id: 'wishlist-1', child_id: 'child-1' }),
        mockWishlist({ id: 'wishlist-2', child_id: 'child-1' }),
      ];

      wishlistRepo.find.mockResolvedValue(wishlists);

      const result = await service.findByChild('child-1');

      expect(result).toEqual(wishlists);
      expect(wishlistRepo.find).toHaveBeenCalledWith({
        where: { child_id: 'child-1' },
        relations: ['target_kindergarten'],
      });
    });

    it('should return empty array when no wishlists found', async () => {
      wishlistRepo.find.mockResolvedValue([]);

      const result = await service.findByChild('child-1');

      expect(result).toEqual([]);
    });

    it('should include target_kindergarten relation', async () => {
      wishlistRepo.find.mockResolvedValue([]);

      await service.findByChild('child-1');

      expect(wishlistRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['target_kindergarten'],
        }),
      );
    });
  });

  describe('findOne()', () => {
    it('should return wishlist with relations', async () => {
      const wishlist = mockWishlist({ id: 'wishlist-1' });
      wishlistRepo.findOne.mockResolvedValue(wishlist);

      const result = await service.findOne('wishlist-1');

      expect(result).toEqual(wishlist);
      expect(wishlistRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'wishlist-1' },
        relations: ['child', 'target_kindergarten'],
      });
    });

    it('should return null when not found', async () => {
      wishlistRepo.findOne.mockResolvedValue(null);

      const result = await service.findOne('wishlist-1');

      expect(result).toBeNull();
    });
  });
});

