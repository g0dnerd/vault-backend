import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DraftPlayersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.draftPlayer.findMany({
      select: { id: true, draftId: true },
    });
  }

  getPoolStatus(tournamentId: number, userId: number) {
    return this.prisma.draftPlayer.findFirst({
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
        checkedIn: true,
        checkedOut: true,
      },
    });
  }
}
