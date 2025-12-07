import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child, Gender, AgeGroup } from '../entities/child.entity';
import { calculateAgeGroup } from '../utils/age-group.util';

export interface CreateChildDto {
  name: string;
  birth_date: Date;
  gender: Gender;
  parent_id: string;
  current_kindergarten_id: string;
}

export interface UpdateChildDto {
  name?: string;
  birth_date?: Date;
  gender?: Gender;
  current_kindergarten_id?: string;
}

@Injectable()
export class ChildService {
  constructor(
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
  ) {}

  /**
   * Create a new child
   * Automatically calculates and sets the age group based on birth date
   */
  async create(createChildDto: CreateChildDto): Promise<Child> {
    const child = this.childRepository.create(createChildDto);

    // Automatically calculate age group from birth date
    const ageGroup = calculateAgeGroup(child.birth_date);

    if (!ageGroup) {
      throw new Error(
        `Child age is outside the valid kindergarten age range. ` +
          `Birth date: ${child.birth_date}`,
      );
    }

    child.group = ageGroup;

    // The age_group field is kept for backwards compatibility
    // You might want to calculate it as a number if still needed
    const birthDate = new Date(child.birth_date);
    const ageInYears =
      (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    child.age_group = Math.floor(ageInYears);

    return this.childRepository.save(child);
  }

  /**
   * Update a child
   * Recalculates age group if birth date is updated
   */
  async update(id: string, updateChildDto: UpdateChildDto): Promise<Child> {
    const child = await this.childRepository.findOne({ where: { id } });

    if (!child) {
      throw new Error(`Child with ID ${id} not found`);
    }

    // Update fields
    Object.assign(child, updateChildDto);

    // Recalculate age group if birth date changed
    if (updateChildDto.birth_date) {
      const ageGroup = calculateAgeGroup(child.birth_date);

      if (!ageGroup) {
        throw new Error(
          `Child age is outside the valid kindergarten age range. ` +
            `Birth date: ${child.birth_date}`,
        );
      }

      child.group = ageGroup;

      const birthDate = new Date(child.birth_date);
      const ageInYears =
        (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      child.age_group = Math.floor(ageInYears);
    }

    return this.childRepository.save(child);
  }

  /**
   * Get all children in a specific age group
   */
  async findByAgeGroup(ageGroup: AgeGroup): Promise<Child[]> {
    return this.childRepository.find({
      where: { group: ageGroup },
      relations: ['parent', 'current_kindergarten', 'wishlists'],
    });
  }

  /**
   * Get a child by ID
   */
  async findOne(id: string): Promise<Child | null> {
    return this.childRepository.findOne({
      where: { id },
      relations: ['parent', 'current_kindergarten', 'wishlists'],
    });
  }

  /**
   * Get all children for a parent
   */
  async findByParent(parentId: string): Promise<Child[]> {
    return this.childRepository.find({
      where: { parent_id: parentId },
      relations: ['current_kindergarten', 'wishlists'],
    });
  }

  /**
   * Recalculate age group for a child
   * Useful for batch updates or cron jobs as children age
   */
  async recalculateAgeGroup(id: string): Promise<Child> {
    const child = await this.childRepository.findOne({ where: { id } });

    if (!child) {
      throw new Error(`Child with ID ${id} not found`);
    }

    const ageGroup = calculateAgeGroup(child.birth_date);

    if (ageGroup && ageGroup !== child.group) {
      child.group = ageGroup;
      return this.childRepository.save(child);
    }

    return child;
  }

  /**
   * Recalculate age groups for all children
   * Should be run periodically (e.g., daily or weekly)
   */
  async recalculateAllAgeGroups(): Promise<{
    updated: number;
    unchanged: number;
    outOfRange: number;
  }> {
    const children = await this.childRepository.find();

    let updated = 0;
    let unchanged = 0;
    let outOfRange = 0;

    for (const child of children) {
      const newAgeGroup = calculateAgeGroup(child.birth_date);

      if (!newAgeGroup) {
        outOfRange++;
        continue;
      }

      if (newAgeGroup !== child.group) {
        child.group = newAgeGroup;
        await this.childRepository.save(child);
        updated++;
      } else {
        unchanged++;
      }
    }

    return { updated, unchanged, outOfRange };
  }
}
