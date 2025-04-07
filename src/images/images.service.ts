import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { NestMinioService } from 'nestjs-minio';
import { Image, ImageType } from '@prisma/client';

import { CreateImageDto } from './dto/create-image.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../roles-guard/role.enum';
import { MinioError } from './storage.error';

@Injectable()
export class ImagesService {
  // URLs from MinIO expire after 24 hours.
  // Set cache expiry to the same value so that the cache always misses expired URLs.
  private readonly minioUrlTTL = 24 * 60 * 60;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly minioService: NestMinioService,
  ) {}

  create(createImageDto: CreateImageDto) {
    return this.prisma.image.create({ data: createImageDto });
  }

  async findAll(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });

    if (!user.roles.includes(Role.Admin)) {
      const images = await this.prisma.image.findMany({
        where: {
          draftPlayer: {
            enrollment: {
              userId,
            },
          },
        },
        select: {
          storagePath: true,
          id: true,
        },
      });
      return this.mapUrlsToImages(images);
    }

    const images = await this.prisma.image.findMany({
      select: {
        storagePath: true,
        id: true,
      },
    });
    return this.mapUrlsToImages(images);
  }

  async handleUpload(
    file: Express.Multer.File,
    userId: number,
    tournamentId: number,
    checkin: boolean,
  ) {
    const client = this.minioService.getMinio();

    // Find the draft player for the current user that is in an ongoing draft
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
        draft: {
          select: {
            phase: { select: { phaseIndex: true } },
            cube: { select: { name: true } },
          },
        },
        enrollment: {
          select: {
            user: { select: { username: true } },
          },
        },
      },
    });

    // Construct the filename for S3 as:
    // <username>-phase<phaseIndex>-<cube>-<checkin/checkout>.jpg
    // for example: paul-phase1-shivan-checkin.jpg
    const cube = player.draft.cube.name.toLowerCase();
    const phaseIdx = player.draft.phase.phaseIndex;
    const username = player.enrollment.user.username.toLowerCase();
    const checkInStr = checkin ? 'checkin' : 'checkout';
    const timestamp = new Date().toISOString();

    const filename = `${username}-phase${phaseIdx}-${cube}-${checkInStr}-${timestamp}.jpg`;

    // Define image metadata
    const metaData = {
      'Content-Type': file.mimetype,
      'X-Amz-Meta-Timestamp': timestamp,
      'X-Amz-Meta-Imagetype': `${checkInStr}`,
      'X-Amz-Meta-Cube': `${cube}`,
    };

    const imageType: ImageType = checkin
      ? ImageType.CHECKIN
      : ImageType.CHECKOUT;

    // Create the `Image` database object
    try {
      await this.prisma.image.create({
        data: {
          draftPlayerId: player.id,
          storagePath: filename,
          imageType,
        },
      });
    } catch (error) {
      console.error('MinIO error:', error);
      throw new MinioError();
    }

    // Try to upload the image to S3 storage
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
      await this.prisma.image.delete({ where: { storagePath: filename } });
      throw new MinioError();
    }

    try {
      const url = await client.presignedGetObject(
        'user-upload',
        filename,
        this.minioUrlTTL,
      );
      // Set the URL into cache for 24 hrs
      await this.cacheManager.set(filename, url, this.minioUrlTTL * 1000);

      if (checkin && !player.checkedIn) {
        this.prisma.draftPlayer.update({
          where: { id: player.id },
          data: { checkedIn: true },
        });
      }
      if (!checkin && !player.checkedOut) {
        this.prisma.draftPlayer.update({
          where: { id: player.id },
          data: { checkedOut: true },
        });
      }
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
      select: {
        storagePath: true,
        id: true,
      },
    });

    if (!images) {
      throw new NotFoundException('No images found for user');
    }

    // Return only image IDs and their pre-signed URLs for front end usage.
    return this.mapUrlsToImages(images);
  }

  async findOne(id: number, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });

    let image = await this.prisma.image.findUnique({
      where: { id },
      select: {
        draftPlayer: {
          select: {
            enrollment: {
              select: {
                userId: true,
              },
            },
          },
        },
        id: true,
        storagePath: true,
      },
    });

    if (!user.roles.includes(Role.Admin)) {
      if (image.draftPlayer.enrollment.userId !== userId) {
        throw new UnauthorizedException(
          'User is not authorized to view this image',
        );
      }
    }

    return this.mapUrlsToImages([
      { id: image.id, storagePath: image.storagePath },
    ]);
  }

  async remove(id: number, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });

    const image = await this.prisma.image.findUnique({
      where: { id },
      select: {
        storagePath: true,
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

    if (!user.roles.includes(Role.Admin)) {
      if (image.draftPlayer.enrollment.userId !== userId) {
        throw new UnauthorizedException(
          'User is not authorized to delete this image',
        );
      }
    }

    const client = this.minioService.getMinio();
    client.removeObject('user-upload', image.storagePath);
    this.cacheManager.del(image.storagePath);

    return this.prisma.image.delete({ where: { id } });
  }

  // Gets the pre-signed URL for each image object.
  // Attempts to get these from cache first and queries them from MinIO on cache miss.
  private async mapUrlsToImages(
    images: Partial<Image>[],
  ): Promise<{ id: number; url: string }[]> {
    const client = this.minioService.getMinio();

    const urls = await Promise.all(
      images.map(async (image) => {
        // Check the cache for a valid URL for this image
        let url = await this.cacheManager.get<string>(image.storagePath);

        // On cache miss, query the URL from MinIO and set it into cache.
        if (!url) {
          url = await client.presignedGetObject(
            'user-upload',
            image.storagePath,
            this.minioUrlTTL,
          );
          await this.cacheManager.set(
            image.storagePath,
            url,
            this.minioUrlTTL * 1000,
          );
        }

        return {
          id: image.id,
          url,
        };
      }),
    );
    return urls;
  }
}
