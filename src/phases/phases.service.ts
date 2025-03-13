import { Injectable } from '@nestjs/common';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhasesService {
  constructor(private prisma: PrismaService) {}

  create(createPhaseDto: CreatePhaseDto) {
    return this.prisma.phase.create({ data: createPhaseDto });
  }

  findAll() {
    return this.prisma.phase.findMany();
  }

  findOne(id: number) {
    return this.prisma.phase.findUnique({ where: { id } });
  }

  update(id: number, updatePhaseDto: UpdatePhaseDto) {
    return this.prisma.phase.update({ where: { id }, data: updatePhaseDto });
  }

  remove(id: number) {
    return this.prisma.phase.delete({ where: { id } });
  }
}
