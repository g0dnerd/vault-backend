import { Injectable } from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TournamentsService {
  constructor(private prisma: PrismaService) {}

  create(createTournamentDto: CreateTournamentDto) {
    return this.prisma.tournament.create({ data: createTournamentDto });
  }

  findAll() {
    return this.prisma.tournament.findMany();
  }

  findAllPublic() {
    return this.prisma.tournament.findMany({
      where: { public: true },
    });
  }

  findOne(id: number) {
    return this.prisma.tournament.findUnique({ where: { id } });
  }

  async findByUser(userId: number) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: userId },
    });
    return this.prisma.tournament.findMany({
      where: {
        id: {
          in: enrollments.map((enrollment) => enrollment.tournamentId),
        },
      },
    });
  }

  async findLeaguesByUser(userId: number) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: userId },
    });
    return this.prisma.tournament.findMany({
      where: {
        id: {
          in: enrollments.map((enrollment) => enrollment.tournamentId),
        },
        isLeague: true,
      },
    });
  }

  async findAvailableForUser(userId: number) {
    return this.prisma.tournament.findMany({
      where: {
        public: true,
        id: {
          notIn: (
            await this.prisma.enrollment.findMany({
              where: { userId },
              select: { tournamentId: true },
            })
          ).map((enrollment) => enrollment.tournamentId),
        },
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
