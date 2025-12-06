import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Child } from './child.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    full_name: string;

    @Column({ nullable: true })
    password_hash: string;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => Child, (child) => child.parent)
    children: Child[];
}
