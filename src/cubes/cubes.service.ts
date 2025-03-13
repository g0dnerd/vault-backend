import { Injectable } from '@nestjs/common';
import { CreateCubeDto } from './dto/create-cube.dto';
import { UpdateCubeDto } from './dto/update-cube.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CubesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCubeDto: CreateCubeDto) {
    return this.prisma.cube.create({ data: createCubeDto });
  }

  findAll() {
    return this.prisma.cube.findMany({
      include: {
        creator: {
          select: {
            username: true,
          },
        },
      },
    });
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
}
