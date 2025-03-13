import { Module } from '@nestjs/common';
import { CubesService } from './cubes.service';
import { CubesController } from './cubes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [CubesController],
  providers: [CubesService],
  imports: [PrismaModule],
})
export class CubesModule {}
