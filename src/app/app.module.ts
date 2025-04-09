import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CubesModule } from '../cubes/cubes.module';
import { DraftsModule } from '../drafts/drafts.module';
import { DraftPlayersModule } from '../draft-players/draft-players.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { ImagesModule } from '../images/images.module';
import { MatchesModule } from '../matches/matches.module';
import { PhasesModule } from '../phases/phases.module';
import { RoundsModule } from '../rounds/rounds.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { UsersModule } from '../users/users.module';
import { MatchGateway } from '../matches/matches.gateway';
import { MatchesService } from '../matches/matches.service';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    // globally provide `ConfigService` for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      // FIXME: why does this sometimes also work with this set to true?
      ignoreEnvFile: false,
    }),

    NestjsFormDataModule.config({
      cleanupAfterFailedHandle: true,
      cleanupAfterSuccessHandle: true,
      storage: MemoryStoredFile,
      isGlobal: true,
    }),

    // register the redis cache asynchronously with the connection data from an injected config service.
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: parseInt(configService.get<string>('REDIS_PORT'), 10),
          },
          username: configService.get<string>('REDIS_USERNAME'),
          password: configService.get<string>('REDIS_PASSWORD'),
        });
        return {
          store: () => store,
          ttl: 5000,
        };
      },
    }),
    PrismaModule,
    AuthModule,
    CubesModule,
    DraftPlayersModule,
    DraftsModule,
    EnrollmentsModule,
    ImagesModule,
    MatchesModule,
    PhasesModule,
    RoundsModule,
    TournamentsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, MatchGateway, MatchesService],
})
export class AppModule {}
