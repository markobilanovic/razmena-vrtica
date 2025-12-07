import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Child } from './child.entity';

export enum MatchStatus {
  PENDING_ACCEPTANCE = 'PENDING_ACCEPTANCE',
  ACTIVE_CONTACT = 'ACTIVE_CONTACT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class MatchGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.PENDING_ACCEPTANCE,
  })
  status: MatchStatus;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => MatchParticipant, (participant) => participant.match_group)
  participants: MatchParticipant[];
}

@Entity()
export class MatchParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MatchGroup, (group) => group.participants)
  @JoinColumn({ name: 'match_group_id' })
  match_group: MatchGroup;

  @Column()
  match_group_id: string;

  @ManyToOne(() => Child)
  @JoinColumn({ name: 'child_id' })
  child: Child;

  @Column()
  child_id: string;

  @ManyToOne(() => Child)
  @JoinColumn({ name: 'next_child_id' })
  next_child: Child; // The child/spot this participant receives spot FROM

  @Column()
  next_child_id: string;

  @Column({ default: false })
  has_accepted: boolean;
}
