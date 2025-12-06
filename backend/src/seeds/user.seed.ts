import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedUsers(dataSource: DataSource): Promise<User[]> {
    const userRepository = dataSource.getRepository(User);

    const usersData = [
        { email: 'test@example.com', full_name: 'Test Kojić', password_hash: 'password' }, // Deterministic test user
        { email: 'marko.j@example.com', full_name: 'Marko Jovanović', password_hash: 'password' },
        { email: 'jelena.p@example.com', full_name: 'Jelena Petrović', password_hash: 'password' },
        { email: 'nikola.n@example.com', full_name: 'Nikola Nikolić', password_hash: 'password' },
        { email: 'ana.d@example.com', full_name: 'Ana Đorđević', password_hash: 'password' },
        { email: 'milos.s@example.com', full_name: 'Miloš Stojanović', password_hash: 'password' },
        { email: 'milica.i@example.com', full_name: 'Milica Ilić', password_hash: 'password' },
        { email: 'luka.m@example.com', full_name: 'Luka Marković', password_hash: 'password' },
        { email: 'marija.k@example.com', full_name: 'Marija Kostić', password_hash: 'password' },
        { email: 'stefan.v@example.com', full_name: 'Stefan Vasić', password_hash: 'password' },
        { email: 'dragana.z@example.com', full_name: 'Dragana Živković', password_hash: 'password' },
        { email: 'aleksandar.t@example.com', full_name: 'Aleksandar Tomić', password_hash: 'password' },
        { email: 'sofija.l@example.com', full_name: 'Sofija Lukić', password_hash: 'password' },
        { email: 'vuk.b@example.com', full_name: 'Vuk Bogdanović', password_hash: 'password' },
        { email: 'katarina.r@example.com', full_name: 'Katarina Ristić', password_hash: 'password' },
        { email: 'filip.p@example.com', full_name: 'Filip Pavlović', password_hash: 'password' },
    ];

    const users: User[] = [];

    for (const userData of usersData) {
        let user = await userRepository.findOneBy({ email: userData.email });
        if (!user) {
            user = new User();
            user.email = userData.email;
            user.full_name = userData.full_name;
            user.password_hash = await bcrypt.hash(userData.password_hash, 10);
            // If you actually use auth, you might need a real hash. Assuming plain for now or irrelevant for this specific test
        }
        users.push(user);
    }

    const savedUsers = await userRepository.save(users);
    console.log(`Successfully seeded ${savedUsers.length} users!`);
    return savedUsers;
}
