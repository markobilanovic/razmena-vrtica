import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Kindergarten } from './entities/kindergarten.entity';
import { Child } from './entities/child.entity';
import { Wishlist } from './entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from './entities/match.entity';
import { HiddenMatch } from './entities/hidden-match.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'admin',
  password: 'password',
  database: 'razmena_vrtica',
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
});
