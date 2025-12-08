import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Kindergarten } from './entities/kindergarten.entity';
import { Child } from './entities/child.entity';
import { Wishlist } from './entities/wishlist.entity';
import { MatchGroup, MatchParticipant } from './entities/match.entity';
import { HiddenMatch } from './entities/hidden-match.entity';
import { MatchingModule } from './modules/matching.module';
import { AuthModule } from './modules/auth.module';
import { UsersModule } from './modules/users.module';
import { KindergartenModule } from './modules/kindergarten.module';
import { WishlistModule } from './modules/wishlist.module';
import { ChildModule } from './modules/child.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
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
        HiddenMatch,
      ],
      synchronize: true,
    }),
    MatchingModule,
    AuthModule,
    UsersModule,
    KindergartenModule,
    WishlistModule,
    ChildModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
