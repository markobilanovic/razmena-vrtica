import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Child } from './child.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  full_name: string;

  @Column({ type: 'varchar', nullable: true })
  password_hash: string | null;

  @Column({ type: 'boolean', default: false })
  email_confirmed: boolean;

  @Column({ type: 'varchar', nullable: true })
  email_confirmation_token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  email_confirmation_token_expires: Date | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  google_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Child, (child) => child.parent)
  children: Child[];
}
