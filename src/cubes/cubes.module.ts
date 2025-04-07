import { Module } from '@nestjs/common';
import { CubesService } from './cubes.service';
import { CubesController } from './cubes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { NestMinioModule } from 'nestjs-minio';

@Module({
  controllers: [CubesController],
  providers: [CubesService],
  imports: [
    PrismaModule,

    // register S3 file storage module
    NestMinioModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // otherwise, get S3 data from environment variables and connect to the bucket
        endPoint: configService.get<string>('S3_ENDPOINT'),
        port: parseInt(configService.get<string>('S3_PORT'), 10),
        useSSL: configService.get<string>('S3_USE_SSL') === 'true',
        accessKey: configService.get<string>('S3_ACCESS_KEY'),
        secretKey: configService.get<string>('S3_SECRET_KEY'),
      }),
    }),
  ],
})
export class CubesModule {}
