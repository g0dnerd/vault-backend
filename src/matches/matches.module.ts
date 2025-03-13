import { Module } from '@nestjs/common';

import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchGateway } from './matches.gateway';

export const ELO_PROPORTIONALITY = 36;

@Module({
  controllers: [MatchesController],
  providers: [MatchesService, MatchGateway],
  imports: [PrismaModule],
})
export class MatchesModule {}
