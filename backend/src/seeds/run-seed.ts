import { DataSource } from 'typeorm';
import { Kindergarten } from '../entities/kindergarten.entity';
import { Child } from '../entities/child.entity';
import { User } from '../entities/user.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from '../entities/match.entity';
import { seedKindergartens } from './kindergarten.seed';
import { seedUsers } from './user.seed';
import { seedChildren } from './child.seed';
import { seedWishlists } from './wishlist.seed';
import { seedMatches } from './match.seed';

// Database configuration
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'razmena_vrtica',
  entities: [Kindergarten, Child, User, Wishlist, MatchGroup, MatchParticipant],
  synchronize: false, // We assume schema is already synced or handled by migrations, but for safe seeding make sure tables exist.
});

async function runSeeds() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connection established!');

    // Clear existing data in reverse order of dependencies
    // Be careful with delete, maybe truncate?

    console.log('Cleaning up old data...');
    const matchParticipantRepo = AppDataSource.getRepository(MatchParticipant);
    const matchGroupRepo = AppDataSource.getRepository(MatchGroup);
    const wishlistRepo = AppDataSource.getRepository(Wishlist);
    const childRepo = AppDataSource.getRepository(Child);
    const userRepo = AppDataSource.getRepository(User);

    // Using delete instead of truncate to respect foreign keys if cascade isn't set,
    // but often delete fails on constraints.
    // Best to delete child elements first.

    // Using raw query to TRUNCATE with CASCADE to handle foreign keys properly
    // Note: Table names must match your DB schema.
    // We use "user" with quotes because it's a reserved keyword.
    const entities = [
      'match_participant',
      'match_group',
      'wishlist',
      'child',
      '"user"',
    ];
    const tableNames = entities.join(', ');

    console.log(`Truncating tables: ${tableNames}...`);
    await AppDataSource.query(`TRUNCATE TABLE ${tableNames} CASCADE;`);

    // We usually keep kindergartens or re-seed them. Kindergarten seed handles its own clearing.

    console.log('Running kindergarten seed...');
    await seedKindergartens(AppDataSource);

    console.log('Running user seed...');
    const users = await seedUsers(AppDataSource);

    console.log('Running child seed...');
    const children = await seedChildren(AppDataSource, users);

    console.log('Running wishlist seed...');
    await seedWishlists(AppDataSource, children);

    console.log('Running match seed...');
    await seedMatches(AppDataSource, children);

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
