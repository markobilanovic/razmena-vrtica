import { DataSource } from 'typeorm';
import { Kindergarten } from '../entities/kindergarten.entity';
import { Child } from '../entities/child.entity';
import { User } from '../entities/user.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from '../entities/match.entity';
import { seedKindergartens } from './kindergarten.seed';

// Database configuration - adjust these values to match your setup
const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'razmena_vrtica',
    entities: [Kindergarten, Child, User, Wishlist, MatchGroup, MatchParticipant],
    synchronize: false,
});

async function runSeeds() {
    try {
        console.log('Connecting to database...');
        await AppDataSource.initialize();
        console.log('Database connection established!');

        console.log('Running kindergarten seed...');
        await seedKindergartens(AppDataSource);

        console.log('All seeds completed successfully!');
    } catch (error) {
        console.error('Error running seeds:', error);
        process.exit(1);
    } finally {
        await AppDataSource.destroy();
        console.log('Database connection closed.');
    }
}

runSeeds();
