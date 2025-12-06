import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Kindergarten } from './kindergarten.entity';
import { Wishlist } from './wishlist.entity';

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
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

    @OneToMany(() => Wishlist, (wishlist) => wishlist.child)
    wishlists: Wishlist[];
}
