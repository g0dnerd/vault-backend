import { Module } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [TournamentsController],
  providers: [TournamentsService],
  imports: [PrismaModule, AuthModule],
})
export class TournamentsModule {}
