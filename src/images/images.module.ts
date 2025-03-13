import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  imports: [PrismaModule],
})
export class ImagesModule {}
