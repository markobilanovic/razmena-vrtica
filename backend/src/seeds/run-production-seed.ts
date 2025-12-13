import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Kindergarten } from '../entities/kindergarten.entity';
import { seedKindergartens } from './kindergarten.seed';

// Load environment variables from .env.production
config({ path: '.env.production' });

// Database configuration - use DATABASE_URL to avoid password encoding issues
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL!,
  entities: [Kindergarten],
  synchronize: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runProductionSeeds() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connection established!');

    console.log('Running kindergarten seed for production...');
    await seedKindergartens(AppDataSource);

    console.log('Production seed completed successfully!');
    console.log('Kindergarten data has been populated.');
  } catch (error) {
    console.error('Error running production seeds:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  }
}

runProductionSeeds();