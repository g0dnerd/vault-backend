import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { existsExtension, softDeleteExtension } from './prisma.extensions';
// import { withOptimize } from '@prisma/extension-optimize';
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaProvider
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // constructor(private readonly configService: ConfigService) {
  //   super();
  // }

  private static initialized = false;

  async onModuleInit() {
    if (!PrismaProvider.initialized) {
      PrismaProvider.initialized = true;
      await this.$connect();
    }
  }

  async onModuleDestroy() {
    if (PrismaProvider.initialized) {
      PrismaProvider.initialized = false;
      await this.$disconnect();
    }
  }

  withExtensions() {
    return (
      this
        //   .$extends(
        //   withOptimize({
        //     apiKey: this.configService.get<string>('OPTIMIZE_API_KEY'),
        //   }),
        // )
        .$extends(existsExtension)
        .$extends(softDeleteExtension)
    );
  }
}
