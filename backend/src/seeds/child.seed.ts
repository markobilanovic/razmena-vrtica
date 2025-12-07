import { DataSource } from 'typeorm';
import { Child, Gender, AgeGroup } from '../entities/child.entity';
import { User } from '../entities/user.entity';
import { Kindergarten } from '../entities/kindergarten.entity';

export async function seedChildren(
  dataSource: DataSource,
  users: User[],
): Promise<Child[]> {
  const childRepository = dataSource.getRepository(Child);
  const kindergartenRepository = dataSource.getRepository(Kindergarten);

  const kindergartens = await kindergartenRepository.find();
  if (kindergartens.length === 0) {
    console.error('No kindergartens found. Please seed kindergartens first.');
    return [];
  }

  // Helper to get random item from array
  const getRandom = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

  const childrenData = [
    // User 0 (Test) has 1 child
    {
      name: 'Mila Kojić',
      age_group: 4,
      gender: Gender.FEMALE,
      group: AgeGroup.SREDNJA,
      parentIndex: 0,
    },

    // Other users have 1 or 2 children
    {
      name: 'Petar Jovanović',
      age_group: 5,
      gender: Gender.MALE,
      group: AgeGroup.STARIJA,
      parentIndex: 1,
    },
    {
      name: 'Dunja Jovanović',
      age_group: 2,
      gender: Gender.FEMALE,
      group: AgeGroup.STARIJA_JASLENA,
      parentIndex: 1,
    },

    {
      name: 'Vuk Petrović',
      age_group: 3,
      gender: Gender.MALE,
      group: AgeGroup.MLADJA,
      parentIndex: 2,
    },

    {
      name: 'Sara Nikolić',
      age_group: 6,
      gender: Gender.FEMALE,
      group: AgeGroup.NAJSTARIJA,
      parentIndex: 3,
    },

    {
      name: 'Lazar Đorđević',
      age_group: 1,
      gender: Gender.MALE,
      group: AgeGroup.MLADJA_JASLENA,
      parentIndex: 4,
    },

    {
      name: 'Nina Stojanović',
      age_group: 4,
      gender: Gender.FEMALE,
      group: AgeGroup.SREDNJA,
      parentIndex: 5,
    },

    {
      name: 'Mihajlo Ilić',
      age_group: 5,
      gender: Gender.MALE,
      group: AgeGroup.STARIJA,
      parentIndex: 6,
    },

    {
      name: 'Una Marković',
      age_group: 2,
      gender: Gender.FEMALE,
      group: AgeGroup.STARIJA_JASLENA,
      parentIndex: 7,
    },
    {
      name: 'Vanja Marković',
      age_group: 4,
      gender: Gender.MALE,
      group: AgeGroup.SREDNJA,
      parentIndex: 7,
    },

    {
      name: 'Kosta Kostić',
      age_group: 3,
      gender: Gender.MALE,
      group: AgeGroup.MLADJA,
      parentIndex: 8,
    },

    {
      name: 'Lena Vasić',
      age_group: 6,
      gender: Gender.FEMALE,
      group: AgeGroup.NAJSTARIJA,
      parentIndex: 9,
    },

    {
      name: 'Ognjen Živković',
      age_group: 1,
      gender: Gender.MALE,
      group: AgeGroup.MLADJA_JASLENA,
      parentIndex: 10,
    },

    {
      name: 'Iva Tomić',
      age_group: 5,
      gender: Gender.FEMALE,
      group: AgeGroup.STARIJA,
      parentIndex: 11,
    },

    {
      name: 'Tadija Lukić',
      age_group: 2,
      gender: Gender.MALE,
      group: AgeGroup.STARIJA_JASLENA,
      parentIndex: 12,
    },

    {
      name: 'Tara Bogdanović',
      age_group: 4,
      gender: Gender.FEMALE,
      group: AgeGroup.SREDNJA,
      parentIndex: 13,
    },

    {
      name: 'Viktor Ristić',
      age_group: 3,
      gender: Gender.MALE,
      group: AgeGroup.MLADJA,
      parentIndex: 14,
    },

    {
      name: 'Anja Pavlović',
      age_group: 6,
      gender: Gender.FEMALE,
      group: AgeGroup.NAJSTARIJA,
      parentIndex: 15,
    },
  ];

  const children: Child[] = [];

  for (const data of childrenData) {
    // Reuse existing child if found (by name and parent) to avoid dupes on re-run without clean
    // Ideally we wipe db, but check just in case.
    // Since we are clearing DB in run-seed, we can just create new ones.

    const child = new Child();
    child.name = data.name;
    child.age_group = data.age_group; // keeping legacy field for now if needed, though 'group' is the enum
    child.gender = data.gender;
    child.group = data.group;
    child.birth_date = new Date(); // Mock date, not using for logic yet
    // Set birth year roughly based on age group to look real
    child.birth_date.setFullYear(
      child.birth_date.getFullYear() - data.age_group,
    );

    child.parent = users[data.parentIndex];

    // Randomly assign a kindergarten
    child.current_kindergarten = getRandom(kindergartens);

    children.push(child);
  }

  const savedChildren = await childRepository.save(children);
  console.log(`Successfully seeded ${savedChildren.length} children!`);
  return savedChildren;
}
