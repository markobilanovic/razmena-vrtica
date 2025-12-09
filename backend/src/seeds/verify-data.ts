import { DataSource } from 'typeorm';
import { Kindergarten } from '../entities/kindergarten.entity';
import { Child } from '../entities/child.entity';
import { User } from '../entities/user.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from '../entities/match.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  entities: [Kindergarten, Child, User, Wishlist, MatchGroup, MatchParticipant],
  synchronize: false,
});

async function verifyData() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connection established!');

    const kindergartenRepository = AppDataSource.getRepository(Kindergarten);
    const kindergartens = await kindergartenRepository.find({ take: 10 });

    console.log('\n✅ First 10 kindergartens in the database:\n');
    kindergartens.forEach((k, i) => {
      console.log(`${i + 1}. ${k.name} - ${k.address} (${k.city})`);
    });

    const total = await kindergartenRepository.count();
    console.log(`\n📊 Total kindergartens: ${total}`);

    const userRepo = AppDataSource.getRepository(User);
    console.log(`📊 Total users: ${await userRepo.count()}`);

    const childRepo = AppDataSource.getRepository(Child);
    console.log(`📊 Total children: ${await childRepo.count()}`);

    const wishlistRepo = AppDataSource.getRepository(Wishlist);
    console.log(`📊 Total wishlists: ${await wishlistRepo.count()}`);

    const matchGroupRepo = AppDataSource.getRepository(MatchGroup);
    console.log(`📊 Total matches: ${await matchGroupRepo.count()}`);

    const matchParticipantRepo = AppDataSource.getRepository(MatchParticipant);
    console.log(
      `📊 Total match participants: ${await matchParticipantRepo.count()}\n`,
    );
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  }
}

verifyData();
