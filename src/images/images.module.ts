import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestMinioModule } from 'nestjs-minio';

import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  imports: [
    PrismaModule,

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
  ],
})
export class ImagesModule {}
