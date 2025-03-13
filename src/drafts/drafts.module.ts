import { Module } from '@nestjs/common';
import { DraftsService } from './drafts.service';
import { DraftsController } from './drafts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [DraftsController],
  providers: [DraftsService],
  imports: [PrismaModule],
})
export class DraftsModule {}
