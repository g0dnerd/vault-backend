import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhasesService {
  constructor(private prisma: PrismaService) {}

  async createWithoutPhaseIndex(data: Partial<CreatePhaseDto>) {
    const { tournamentId, numRounds } = data;

    let createPhaseDto: CreatePhaseDto = {
      tournamentId,
      numRounds,
      phaseIndex: 0,
    };

    const phases = await this.prisma.phase.findMany({
      where: { tournamentId },
      orderBy: { phaseIndex: 'desc' },
    });

    if (!phases) {
      createPhaseDto = { ...createPhaseDto, phaseIndex: 1 };
    } else {
      createPhaseDto = {
        ...createPhaseDto,
        phaseIndex: phases[0].phaseIndex + 1,
      };
    }
    try {
      return await this.prisma.phase.create({ data: createPhaseDto });
    } catch (error) {
      return new InternalServerErrorException();
    }
  }

  findAll() {
    return this.prisma.phase.findMany();
  }

  findOne(id: number) {
    return this.prisma.phase.findUnique({ where: { id } });
  }

  findByTournament(tournamentId: number) {
    return this.prisma.phase.findMany({
      where: {
        tournamentId,
      },
      select: {
        id: true,
        numRounds: true,
        phaseIndex: true,
        tournament: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  update(id: number, updatePhaseDto: UpdatePhaseDto) {
    return this.prisma.phase.update({ where: { id }, data: updatePhaseDto });
  }

  remove(id: number) {
    return this.prisma.phase.delete({ where: { id } });
  }
}
