import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Child } from './child.entity';
import { Kindergarten } from './kindergarten.entity';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Child, (child) => child.wishlists)
  @JoinColumn({ name: 'child_id' })
  child: Child;

  @Column()
  child_id: string;

  @ManyToOne(() => Kindergarten)
  @JoinColumn({ name: 'target_kindergarten_id' })
  target_kindergarten: Kindergarten;

  @Column()
  target_kindergarten_id: string;

  @CreateDateColumn()
  created_at: Date;
}
