import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { NestMinioModule } from 'nestjs-minio';

import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  imports: [
    PrismaModule,

    // register the redis cache asynchronously with the connection data from an injected config service.
    CacheModule.registerAsync({
      // imports: [ImagesModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: parseInt(configService.get<string>('REDIS_PORT'), 10),
          },
          username: configService.get<string>('REDIS_USERNAME'),
          password: configService.get<string>('REDIS_PASSWORD'),
        });
        return {
          store: () => store,
          ttl: 5000,
        };
      },
    }),

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
