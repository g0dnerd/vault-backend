import { Module } from '@nestjs/common';
import { PhasesService } from './phases.service';
import { PhasesController } from './phases.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [PhasesController],
  providers: [PhasesService],
  imports: [PrismaModule],
})
export class PhasesModule {}
