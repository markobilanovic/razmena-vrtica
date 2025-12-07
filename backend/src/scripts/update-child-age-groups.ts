import { DataSource } from 'typeorm';
import { Child } from '../entities/child.entity';
import { User } from '../entities/user.entity';
import { Kindergarten } from '../entities/kindergarten.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from '../entities/match.entity';
import { calculateAgeGroup } from '../utils/age-group.util';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'admin',
  password: 'password',
  database: 'razmena_vrtica',
  entities: [User, Kindergarten, Child, Wishlist, MatchGroup, MatchParticipant],
  synchronize: false,
});

async function updateChildAgeGroups() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();

    const childRepository = AppDataSource.getRepository(Child);

    console.log('Fetching all children...');
    const children = await childRepository.find();

    console.log(`Found ${children.length} children to update`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const child of children) {
      const ageGroup = calculateAgeGroup(child.birth_date);

      if (ageGroup) {
        child.group = ageGroup;
        await childRepository.save(child);
        updatedCount++;
        console.log(
          `✓ Updated child ${child.name} (ID: ${child.id}) to group: ${ageGroup}`,
        );
      } else {
        skippedCount++;
        console.log(
          `⚠ Skipped child ${child.name} (ID: ${child.id}) - age out of range`,
        );
      }
    }

    console.log('\n=== Update Summary ===');
    console.log(`Total children: ${children.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log('=====================\n');
  } catch (error) {
    console.error('Error updating child age groups:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
}

// Run the update
updateChildAgeGroups()
  .then(() => {
    console.log('Age group update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Age group update failed:', error);
    process.exit(1);
  });
