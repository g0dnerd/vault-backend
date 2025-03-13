import { Module } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { RoundsController } from './rounds.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [RoundsController],
  providers: [RoundsService],
  imports: [PrismaModule],
})
export class RoundsModule {}
