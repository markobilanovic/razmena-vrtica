import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { MatchGroup } from './match.entity';

@Entity()
export class HiddenMatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @ManyToOne(() => MatchGroup)
  @JoinColumn({ name: 'match_group_id' })
  match_group: MatchGroup;

  @Column()
  match_group_id: string;

  @CreateDateColumn()
  hidden_at: Date;
}
