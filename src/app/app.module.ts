import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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

@Module({
  imports: [
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
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, MatchGateway, MatchesService],
})
export class AppModule {}
