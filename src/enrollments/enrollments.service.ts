import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

interface Scorecard {
  enrollmentId: number;
  username: string;
  points: number;
  matchesPlayed: number;
  gamesPlayed: number;
  matchesWon: number;
  gamesWon: number;
  opponentIds: number[];
  pmw: number;
  pgw: number;
  omw: number;
  ogw: number;
}

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: createEnrollmentDto.tournamentId },
    });
    if (tournament.isLeague) {
      createEnrollmentDto = {
        elo: 1500,
        ...createEnrollmentDto,
      };
    }

    return this.prisma.enrollment.create({
      data: createEnrollmentDto,
      include: { tournament: true },
    });
  }

  enroll(userId: number, tournamentId: number) {
    const createEnrollmentDto = {
      tournamentId,
      userId,
    };
    return this.create(createEnrollmentDto);
  }

  enrollMany(createEnrollmentDto: { tournamentId: number; userIds: number[] }) {
    const { tournamentId, userIds } = createEnrollmentDto;
    const enrollments: CreateEnrollmentDto[] = userIds.map((userId) => ({
      tournamentId,
      userId,
    }));

    return this.prisma.enrollment.createManyAndReturn({
      data: enrollments,
      skipDuplicates: true,
    });
  }

  findAll() {
    return this.prisma.enrollment.findMany();
  }

  findOne(id: number) {
    return this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        tournament: true,
      },
    });
  }

  update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    return this.prisma.enrollment.update({
      where: { id },
      data: updateEnrollmentDto,
    });
  }

  remove(id: number) {
    return this.prisma.enrollment.delete({ where: { id } });
  }

  findByTournament(tournamentId: number) {
    return this.prisma.enrollment.findMany({
      where: { tournamentId },
      select: {
        id: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  findByDraft(draftId: number) {
    return this.prisma.enrollment.findMany({
      where: {
        draftEnrollments: {
          some: {
            draftId,
          },
        },
      },
      select: {
        id: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  async getTournamentStandings(tournamentId: number) {
    const games = await this.prisma.match.findMany({
      where: {
        resultConfirmed: true,
        OR: [
          { player1: { draft: { phase: { tournamentId } } } },
          { player2: { draft: { phase: { tournamentId } } } },
        ],
      },
      include: {
        player1: {
          select: { enrollmentId: true },
        },
        player2: {
          select: { enrollmentId: true },
        },
      },
      orderBy: {
        round: { roundIndex: 'desc' },
      },
    });

    if (!games) {
      throw new NotFoundException();
    }
    const enrollments = await this.prisma.enrollment.findMany({
      where: { tournamentId },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    const scorecards: Scorecard[] = [];

    for (const enrollment of enrollments) {
      let scorecard: Scorecard = {
        enrollmentId: enrollment.id,
        username: enrollment.user.username,
        points: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        opponentIds: [],
        omw: 0.0,
        ogw: 0.0,
        pmw: 0.0,
        pgw: 0.0,
      };
      for (const game of games) {
        if (enrollment.id === game.player1.enrollmentId) {
          scorecard.opponentIds.push(game.player2.enrollmentId);
          scorecard.matchesPlayed += 1;
          scorecard.gamesPlayed += game.player1Wins + game.player2Wins;
          scorecard.gamesWon += game.player1Wins;
          if (game.player1Wins > game.player2Wins) {
            scorecard.points += 3;
            scorecard.matchesWon += 1;
          } else if (game.player1Wins === game.player2Wins) {
            scorecard.points += 1;
          }
        } else if (enrollment.id === game.player2.enrollmentId) {
          scorecard.opponentIds.push(game.player1.enrollmentId);
          scorecard.matchesPlayed += 1;
          scorecard.gamesPlayed += game.player1Wins + game.player2Wins;
          scorecard.gamesWon += game.player2Wins;
          if (game.player2Wins > game.player1Wins) {
            scorecard.points += 3;
            scorecard.matchesWon += 1;
          } else if (game.player1Wins === game.player2Wins) {
            scorecard.points += 1;
          }
        }
      }
      scorecard.pmw = Math.max(
        scorecard.matchesWon / scorecard.matchesPlayed,
        0.33,
      );
      scorecard.pgw = Math.max(
        scorecard.gamesWon / scorecard.gamesPlayed,
        0.33,
      );
      scorecards.push(scorecard);
    }

    for (let scorecard of scorecards) {
      let omw_total = 0.0;
      let ogw_total = 0.0;
      let count = 0;

      for (const opponentId of scorecard.opponentIds) {
        const opponent = scorecards.find(
          (opp) => opp.enrollmentId === opponentId,
        );
        if (opponent) {
          count += 1;
          omw_total += opponent.pmw;
          ogw_total += opponent.pgw;
        }
      }
      scorecard.omw = Math.round(Math.max(omw_total / count, 0.33) * 100) / 100;
      scorecard.ogw = Math.round(Math.max(ogw_total / count, 0.33) * 100) / 100;
      scorecard.pmw = Math.round(scorecard.pmw * 100) / 100;
      scorecard.pgw = Math.round(scorecard.pgw * 100) / 100;
    }

    scorecards.sort((p1, p2) => {
      if (p1.points < p2.points) {
        return 1;
      }
      if (p2.points < p1.points) {
        return -1;
      }

      if (p1.omw < p2.omw) {
        return 1;
      }
      if (p2.omw < p1.omw) {
        return -1;
      }

      if (p1.pgw < p2.pgw) {
        return 1;
      }
      if (p2.pgw < p1.pgw) {
        return -1;
      }

      if (p1.ogw < p2.ogw) {
        return 1;
      }
      if (p2.ogw < p1.ogw) {
        return -1;
      }
      return 0;
    });

    return scorecards;
  }

  findAllLeagueEnrollments() {
    return this.prisma.enrollment.findMany({
      where: { tournament: { isLeague: true } },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        elo: 'desc',
      },
    });
  }

  async findByUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (
      !user.roles.includes(Role.ADMIN) &&
      !user.roles.includes(Role.PLAYER_ADMIN)
    ) {
      return this.prisma.enrollment.findMany({
        where: { userId },
        include: {
          tournament: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      });
    }
    return this.prisma.enrollment.findMany({
      include: {
        tournament: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  findByUserAndTournament(userId: number, tournamentId: number) {
    return this.prisma.enrollment.findFirstOrThrow({
      where: {
        userId,
        tournamentId,
      },
    });
  }
}
