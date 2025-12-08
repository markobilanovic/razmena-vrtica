import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Kindergarten } from '../entities/kindergarten.entity';

@Injectable()
export class KindergartenService {
  constructor(
    @InjectRepository(Kindergarten)
    private kindergartenRepository: Repository<Kindergarten>,
  ) {}

  async findOneById(id: string): Promise<Kindergarten | null> {
    return this.kindergartenRepository.findOne({
      where: { id },
    });
  }

  async findByIds(ids: string[]): Promise<Kindergarten[]> {
    if (ids.length === 0) return [];
    return this.kindergartenRepository.find({
      where: { id: In(ids) },
    });
  }

  async findAll(): Promise<Kindergarten[]> {
    return this.kindergartenRepository.find();
  }
}
