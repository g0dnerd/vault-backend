import { Injectable, UnauthorizedException } from '@nestjs/common';

import { Role } from '../roles-guard/role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { NestMinioService } from 'nestjs-minio';
import { MinioError } from './storage.error';
import { ImageType } from '@prisma/client';

@Injectable()
export class ImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: NestMinioService,
  ) {}

  create(createImageDto: CreateImageDto) {
    return this.prisma.image.create({ data: createImageDto });
  }

  async findAll(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user.roles.includes(Role.Admin)) {
      return this.prisma.image.findMany({
        where: {
          draftPlayer: {
            enrollment: {
              userId,
            },
          },
        },
      });
    }
    return this.prisma.image.findMany();
  }

  async handleUpload(
    file: Express.Multer.File,
    userId: number,
    tournamentId: number,
    checkin: boolean,
  ) {
    const client = this.minioService.getMinio();
    const metaData = {
      'Content-Type': file.mimetype,
      'X-Amz-Meta-Timestamp': new Date().toISOString(),
      'X-Amz-Meta-UserId': `${userId}`,
    };

    const player = await this.prisma.draftPlayer.findFirst({
      where: {
        enrollment: {
          userId,
          tournamentId,
        },
        draft: {
          started: true,
          finished: false,
        },
      },
      select: {
        id: true,
        checkedIn: true,
        checkedOut: true,
        enrollment: {
          select: {
            user: {
              select: { username: true },
            },
          },
        },
      },
    });

    const filename = `${player.enrollment.user.username}-${new Date().toISOString()}.jpg`;

    try {
      await client.putObject(
        'user-upload',
        filename,
        file.buffer,
        file.size,
        metaData,
      );
    } catch (error) {
      console.error('MinIO error:', error);
      throw new MinioError();
    }

    const imageType: ImageType = checkin
      ? ImageType.CHECKIN
      : ImageType.CHECKOUT;

    await this.prisma.image.create({
      data: {
        draftPlayerId: player.id,
        storagePath: filename,
        imageType,
      },
    });

    try {
      const url = await client.presignedGetObject(
        'user-upload',
        filename,
        24 * 60 * 60,
      );
      return { url };
    } catch (error) {
      console.error('MinIO error:', error);
      throw new MinioError();
    }
  }

  async findForUser(userId: number) {
    const images = await this.prisma.image.findMany({
      where: {
        draftPlayer: {
          enrollment: {
            userId,
          },
        },
      },
    });

    if (!images) {
      return [];
    }

    const client = this.minioService.getMinio();
    const ret = [];
    for (const image of images) {
      const url = await client.presignedGetObject(
        'user-upload',
        image.storagePath,
        24 * 60 * 60,
      );
      ret.push({ id: image.id, url });
    }
    return ret;
  }

  async findOne(id: number, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user.roles.includes(Role.Admin)) {
      const image = await this.prisma.image.findUnique({
        where: { id },
        include: {
          draftPlayer: {
            select: {
              enrollment: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });
      if (image.draftPlayer.enrollment.userId !== userId) {
        throw new UnauthorizedException(
          'User is not authorized to view this image',
        );
      }
    }
    return this.prisma.image.findUnique({ where: { id } });
  }

  async update(id: number, updateImageDto: UpdateImageDto, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user.roles.includes(Role.Admin)) {
      const image = await this.prisma.image.findUnique({
        where: { id },
        include: {
          draftPlayer: {
            select: {
              enrollment: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });
      if (image.draftPlayer.enrollment.userId !== userId) {
        throw new UnauthorizedException(
          'User is not authorized to update this image',
        );
      }
    }
    return this.prisma.image.update({ where: { id }, data: updateImageDto });
  }

  async remove(id: number, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user.roles.includes(Role.Admin)) {
      const image = await this.prisma.image.findUnique({
        where: { id },
        include: {
          draftPlayer: {
            select: {
              enrollment: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });
      if (image.draftPlayer.enrollment.userId !== userId) {
        throw new UnauthorizedException(
          'User is not authorized to delete this image',
        );
      }
    }
    return this.prisma.image.delete({ where: { id } });
  }
}
