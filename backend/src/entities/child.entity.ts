import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Kindergarten } from './kindergarten.entity';
import { Wishlist } from './wishlist.entity';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum AgeGroup {
  MLADJA_JASLENA = 'MLADJA_JASLENA', // 0.5y - 1.5y
  STARIJA_JASLENA = 'STARIJA_JASLENA', // 1.5y - 2.5y
  MLADJA = 'MLADJA', // 2.5y - 3.5y
  SREDNJA = 'SREDNJA', // 3.5y - 4.5y
  STARIJA = 'STARIJA', // 4.5y - 5.5y
  NAJSTARIJA = 'NAJSTARIJA', // 5.5y - 6.5y
}

@Entity()
export class Child {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.children)
  @JoinColumn({ name: 'parent_id' })
  parent: User;

  @Column()
  parent_id: string;

  @ManyToOne(() => Kindergarten, (kindergarten) => kindergarten.children)
  @JoinColumn({ name: 'current_kindergarten_id' })
  current_kindergarten: Kindergarten;

  @Column()
  current_kindergarten_id: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  birth_date: Date;

  @Column()
  age_group: number;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'enum', enum: AgeGroup })
  group: AgeGroup;

  @OneToMany(() => Wishlist, (wishlist) => wishlist.child)
  wishlists: Wishlist[];
}
