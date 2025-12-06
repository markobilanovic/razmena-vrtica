import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Kindergarten } from './entities/kindergarten.entity';
import { Child } from './entities/child.entity';
import { Wishlist } from './entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from './entities/match.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'admin',
      password: 'password',
      database: 'razmena_vrtica',
      entities: [User, Kindergarten, Child, Wishlist, MatchGroup, MatchParticipant],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
