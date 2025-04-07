import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CubeWithFileDto } from './dto/create-cube.dto';
import { UpdateCubeDto } from './dto/update-cube.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NestMinioService } from 'nestjs-minio';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { MinioError } from 'src/images/storage.error';
import { Cube } from '@prisma/client';
import { DuplicateCubeException } from './cubes.exception';

@Injectable()
export class CubesService {
  private readonly minioUrlTTL = 24 * 60 * 60;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly minioService: NestMinioService,
  ) {}

  async create(createCubeDto: CubeWithFileDto, userId: number) {
    const client = this.minioService.getMinio();

    const { thumbnail, ...data } = createCubeDto;
    const datestamp = new Date().toDateString();
    const timestamp = new Date().toTimeString();
    const name = data.name.replace(/ /g, '').toLowerCase();
    const filename = `${name}-thumbnail.jpg`;

    const metaData = {
      'Content-Type': thumbnail.mimetype,
      'X-Amz-Meta-Date': datestamp,
      'X-Amz-Meta-Timestamp': timestamp,
      'X-Amz-Meta-Cube-Name': `${name}`,
    };

    // Try to upload the image to S3 storage
    try {
      await client.putObject(
        'user-upload',
        filename,
        thumbnail.buffer,
        thumbnail.size,
        metaData,
      );
    } catch (error) {
      console.error('MinIO error:', error);
      throw new MinioError();
    }

    let imageUrl = '';
    try {
      imageUrl = await client.presignedGetObject(
        'user-upload',
        filename,
        this.minioUrlTTL,
      );

      // Set the URL into cache for 24 hrs
      await this.cacheManager.set(filename, imageUrl, this.minioUrlTTL * 1000);
    } catch (error) {
      console.error('Error while creating cube:', error);
      throw new MinioError();
    }

    try {
      // Conform cube fields to front end expectations
      const cube = await this.prisma.cube.create({
        data: {
          ...data,
          imageStoragePath: filename,
          creatorId: userId,
        },
        omit: {
          imageStoragePath: true,
          creatorId: true,
        },
        include: {
          creator: {
            select: {
              username: true,
            },
          },
        },
      });

      return { imageUrl, ...cube };
    } catch (error) {
      console.log('Could not create cube:', error);
      throw new DuplicateCubeException();
    }
  }

  async findAll() {
    const cubes = await this.prisma.cube.findMany({
      include: {
        creator: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!cubes) {
      throw new NotFoundException('No cubes found');
    }

    return this.mapUrls(cubes);
  }

  findOne(id: number) {
    return this.prisma.cube.findUnique({ where: { id } });
  }

  update(id: number, updateCubeDto: UpdateCubeDto) {
    return this.prisma.cube.update({ where: { id }, data: updateCubeDto });
  }

  remove(id: number) {
    return this.prisma.cube.delete({ where: { id } });
  }

  // Gets the pre-signed URL for each object.
  // Attempts to get these from cache first and queries them from MinIO on cache miss.
  private async mapUrls(cubes: Cube[]): Promise<
    {
      id: number;
      name: string;
      numCards?: number;
      shortDescription?: string;
      longDescription: string;
      cobraUrl: string;
      imageUrl: string;
    }[]
  > {
    const client = this.minioService.getMinio();

    const urls = await Promise.all(
      cubes.map(async (cube) => {
        console.log(
          'Mapping cube ' +
            cube.name +
            ' with storagePath ' +
            cube.imageStoragePath,
        );
        // Check the cache for a valid URL
        let url = await this.cacheManager.get<string>(cube.imageStoragePath);

        // On cache miss, query the URL from MinIO and set it into cache.
        if (!url) {
          url = await client.presignedGetObject(
            'user-upload',
            cube.imageStoragePath,
            this.minioUrlTTL,
          );

          await this.cacheManager.set(
            cube.imageStoragePath,
            url,
            this.minioUrlTTL * 1000,
          );
        }

        const { creatorId, imageStoragePath, ...ret } = cube;

        return {
          ...ret,
          imageUrl: url,
        };
      }),
    );
    return urls;
  }
}
