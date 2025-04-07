import { Injectable } from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class TournamentsService {
  constructor(private prisma: PrismaService) {}

  create(createTournamentDto: CreateTournamentDto) {
    return this.prisma.tournament.create({ data: createTournamentDto });
  }

  async findAll(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });

    if (
      user.roles.includes(Role.PLAYER_ADMIN) ||
      user.roles.includes(Role.ADMIN)
    ) {
      return this.prisma.tournament.findMany();
    }

    return this.prisma.tournament.findMany({
      where: { public: true },
    });
  }

  async findEnrolled(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });

    if (
      user.roles.includes(Role.PLAYER_ADMIN) ||
      user.roles.includes(Role.ADMIN)
    ) {
      return this.prisma.tournament.findMany({
        select: {
          id: true,
        },
      });
    }

    return this.prisma.tournament.findMany({
      where: {
        enrollments: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  async findLeaguesByUser(userId: number) {
    return this.prisma.tournament.findMany({
      where: {
        enrollments: {
          some: {
            userId,
          },
        },
        isLeague: true,
      },
      select: {
        id: true,
      },
    });
  }

  async findAvailableForUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });
    if (
      user.roles.includes(Role.PLAYER_ADMIN) ||
      user.roles.includes(Role.ADMIN)
    ) {
      return [];
    }

    return this.prisma.tournament.findMany({
      where: {
        public: true,
        enrollments: {
          none: {
            userId,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  update(id: number, updateTournamentDto: UpdateTournamentDto) {
    return this.prisma.tournament.update({
      where: { id },
      data: updateTournamentDto,
    });
  }

  remove(id: number) {
    return this.prisma.tournament.delete({ where: { id } });
  }
}
