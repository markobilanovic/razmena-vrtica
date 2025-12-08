import { DataSource } from 'typeorm';
import { MatchGroup, MatchParticipant } from './src/entities/match.entity';
import { MatchStatus } from '@repo/shared';
import { Kindergarten } from './src/entities/kindergarten.entity';
import { Child } from './src/entities/child.entity';
import { User } from './src/entities/user.entity';
import { Wishlist } from './src/entities/wishlist.entity';

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

async function cancelMatch() {
  await AppDataSource.initialize();

  const matchRepo = AppDataSource.getRepository(MatchGroup);
  const matches = await matchRepo.find({
    relations: ['participants', 'participants.child'],
  });

  console.log('Available matches:');
  matches.forEach((match) => {
    console.log(
      `- ID: ${match.id}, Status: ${match.status}, Participants: ${match.participants?.length}`,
    );
  });

  if (matches.length > 0) {
    const firstMatch = matches[0];
    console.log(`\nCanceling match ${firstMatch.id}...`);
    firstMatch.status = MatchStatus.CANCELLED;
    await matchRepo.save(firstMatch);
    console.log('Match canceled successfully!');
  }

  await AppDataSource.destroy();
}

cancelMatch().catch(console.error);
