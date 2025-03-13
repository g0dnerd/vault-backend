import { Injectable } from '@nestjs/common';
import { CreateRoundDto } from './dto/create-round.dto';
import { UpdateRoundDto } from './dto/update-round.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoundsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createRoundDto: CreateRoundDto) {
    return this.prisma.round.create({ data: createRoundDto });
  }

  findAll() {
    return this.prisma.round.findMany();
  }

  findOne(id: number) {
    return this.prisma.round.findUnique({
      where: { id },
    });
  }

  update(id: number, updateRoundDto: UpdateRoundDto) {
    return this.prisma.round.update({
      where: { id },
      data: updateRoundDto,
    });
  }

  remove(id: number) {
    return this.prisma.round.delete({ where: { id } });
  }
}
