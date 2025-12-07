import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';
import { Child } from '../entities/child.entity';
import { Kindergarten } from '../entities/kindergarten.entity';
import { MatchingService } from './matching.service';

export interface CreateWishlistDto {
  child_id: string;
  target_kindergarten_id: string;
}

export interface UpdateWishlistDto {
  target_kindergarten_id?: string;
}

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
    @InjectRepository(Kindergarten)
    private kindergartenRepository: Repository<Kindergarten>,
    private matchingService: MatchingService,
  ) {}

  async create(createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
    // Validate child exists
    const child = await this.childRepository.findOne({
      where: { id: createWishlistDto.child_id },
    });
    if (!child) {
      throw new Error('Child not found');
    }

    // Validate kindergarten exists
    const kindergarten = await this.kindergartenRepository.findOne({
      where: { id: createWishlistDto.target_kindergarten_id },
    });
    if (!kindergarten) {
      throw new Error('Target kindergarten not found');
    }

    // Prevent duplicate wishlists
    const existing = await this.wishlistRepository.findOne({
      where: {
        child_id: createWishlistDto.child_id,
        target_kindergarten_id: createWishlistDto.target_kindergarten_id,
      },
    });
    if (existing) {
      throw new Error('Wishlist already exists');
    }

    // Create wishlist
    const wishlist = this.wishlistRepository.create(createWishlistDto);
    const savedWishlist = await this.wishlistRepository.save(wishlist);

    // AUTO-MATCH: Check for new matches after creating wishlist
    this.matchingService
      .checkAndCreateMatchesForChild(createWishlistDto.child_id)
      .catch((error) => {
        console.error('Error auto-creating matches:', error);
      });

    return savedWishlist;
  }

  async update(id: string, updateWishlistDto: UpdateWishlistDto): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({ where: { id } });
    if (!wishlist) {
      throw new Error('Wishlist not found');
    }

    if (updateWishlistDto.target_kindergarten_id) {
      const kindergarten = await this.kindergartenRepository.findOne({
        where: { id: updateWishlistDto.target_kindergarten_id },
      });
      if (!kindergarten) {
        throw new Error('Target kindergarten not found');
      }
    }

    Object.assign(wishlist, updateWishlistDto);
    const savedWishlist = await this.wishlistRepository.save(wishlist);

    // AUTO-MATCH: Check for new matches after updating wishlist
    this.matchingService
      .checkAndCreateMatchesForChild(wishlist.child_id)
      .catch((error) => {
        console.error('Error auto-creating matches:', error);
      });

    return savedWishlist;
  }

  async delete(id: string): Promise<void> {
    const wishlist = await this.wishlistRepository.findOne({ where: { id } });
    if (!wishlist) {
      throw new Error('Wishlist not found');
    }

    const childId = wishlist.child_id;
    await this.wishlistRepository.remove(wishlist);

    // AUTO-MATCH: Check if any existing matches need to be invalidated
    // or if new matches are now possible after removing this wishlist
    this.matchingService
      .checkAndCreateMatchesForChild(childId)
      .catch((error) => {
        console.error('Error auto-creating matches:', error);
      });
  }

  async findByChild(childId: string): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      where: { child_id: childId },
      relations: ['target_kindergarten'],
    });
  }

  async findOne(id: string): Promise<Wishlist | null> {
    return this.wishlistRepository.findOne({
      where: { id },
      relations: ['child', 'target_kindergarten'],
    });
  }
}

