import { DataSource } from 'typeorm';
import { Kindergarten } from '../entities/kindergarten.entity';
import { seedKindergartens } from './kindergarten.seed';

// Database configuration
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  entities: [Kindergarten],
  synchronize: false,
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