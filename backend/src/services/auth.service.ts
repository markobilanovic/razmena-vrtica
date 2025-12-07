
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (user && user.password_hash) {
            const isMatch = await bcrypt.compare(pass, user.password_hash);
            if (isMatch) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password_hash, ...result } = user;
                return result;
            }
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
            }
        };
    }

    async register(user: any) {
        const { email, password, fullName } = user;
        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.usersRepository.save({
            email,
            password_hash: hashedPassword,
            full_name: fullName,
        });
        return this.login(newUser);
    }
}
