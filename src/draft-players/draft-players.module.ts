import { Module } from '@nestjs/common';
import { DraftPlayersService } from './draft-players.service';
import { DraftPlayersController } from './draft-players.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [DraftPlayersController],
  providers: [DraftPlayersService],
  imports: [PrismaModule],
})
export class DraftPlayersModule {}
