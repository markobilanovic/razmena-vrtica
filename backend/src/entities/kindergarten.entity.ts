import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Child } from './child.entity';

@Entity()
export class Kindergarten {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    city: string;

    @Column()
    address: string;

    // Ideally use PostGIS for location, but for simplicity storing as simple lat/long or raw text for now if needed.
    // Using simple columns for now to avoid PostGIS dependency complexity in setup unless requested.
    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    latitude: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    longitude: number | null;

    @OneToMany(() => Child, (child) => child.current_kindergarten)
    children: Child[];
}
