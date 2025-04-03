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
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { NestMinioModule } from 'nestjs-minio';

@Module({
  imports: [
    // globally provide `ConfigService` for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),

    // register the redis cache asynchronously with the connection data from an injected config service.
    CacheModule.registerAsync({
      imports: [AppModule],
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

    // register S3 file storage module
    NestMinioModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // otherwise, get S3 data from environment variables and connect to the bucket
        endPoint: configService.get<string>('S3_ENDPOINT'),
        port: parseInt(configService.get<string>('S3_PORT'), 10),
        useSSL: true,
        accessKey: configService.get<string>('S3_ACCESS_KEY'),
        secretKey: configService.get<string>('S3_SECRET_KEY'),
      }),
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
