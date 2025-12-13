import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { Kindergarten } from './entities/kindergarten.entity';
import { Child } from './entities/child.entity';
import { Wishlist } from './entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from './entities/match.entity';
import { HiddenMatch } from './entities/hidden-match.entity';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  // Support both individual params and connection string
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT!, 10),
        username: process.env.DB_USERNAME!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
      }),
  // Enable SSL for production
  ssl:
    process.env.NODE_ENV === 'production' && process.env.DB_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false,
  entities: [
    User,
    Kindergarten,
    Child,
    Wishlist,
    MatchGroup,
    MatchParticipant,
    HiddenMatch,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  // Production optimizations
  logging: process.env.NODE_ENV === 'development' ? true : ['error'],
  maxQueryExecutionTime: 1000,
});
