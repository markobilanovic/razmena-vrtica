import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Kindergarten } from './entities/kindergarten.entity';
import { Child } from './entities/child.entity';
import { Wishlist } from './entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from './entities/match.entity';
import { MatchingModule } from './modules/matching.module';
import { AuthModule } from './modules/auth.module';
import { UsersModule } from './modules/users.module';
import { KindergartenModule } from './modules/kindergarten.module';
import { WishlistModule } from './modules/wishlist.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
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
      ],
      synchronize: true,
    }),
    MatchingModule,
    AuthModule,
    UsersModule,
    KindergartenModule,
    WishlistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
