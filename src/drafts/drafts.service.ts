import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateDraftDto } from './dto/create-draft.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DraftsService {
  constructor(private prisma: PrismaService) {}

  create(createDraftDto: CreateDraftDto) {
    return this.prisma.draft.create({
      data: createDraftDto,
      include: {
        players: {
          select: {
            enrollment: { select: { user: { select: { username: true } } } },
            seat: true,
            bye: true,
            hadBye: true,
          },
        },
        cube: {
          select: {
            name: true,
            id: true,
          },
        },
        phase: {
          select: {
            tournamentId: true,
            numRounds: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.draft.findUnique({
      where: { id },
      include: {
        players: {
          select: {
            enrollment: { select: { user: { select: { username: true } } } },
            seat: true,
            bye: true,
            hadBye: true,
          },
        },
        cube: {
          select: {
            name: true,
            id: true,
          },
        },
        phase: {
          select: {
            tournamentId: true,
            numRounds: true,
          },
        },
      },
    });
  }

  update(id: number, updateDraftDto: UpdateDraftDto) {
    return this.prisma.draft.update({
      where: { id },
      data: updateDraftDto,
      include: {
        players: {
          select: {
            enrollment: { select: { user: { select: { username: true } } } },
            seat: true,
            bye: true,
            hadBye: true,
          },
        },
        cube: {
          select: {
            name: true,
            id: true,
          },
        },
        phase: {
          select: {
            tournamentId: true,
            numRounds: true,
          },
        },
      },
    });
  }

  remove(id: number) {
    return this.prisma.draft.delete({ where: { id } });
  }

  getOngoingDraftsForTournament(tournamentId: number) {
    return this.prisma.draft.findMany({
      where: {
        started: true,
        finished: false,
        phase: {
          tournamentId,
        },
      },
      include: {
        players: {
          select: {
            enrollment: {
              select: { user: { select: { username: true } } },
            },
            seat: true,
            bye: true,
            hadBye: true,
          },
        },
        cube: {
          select: {
            name: true,
            id: true,
          },
        },
        phase: {
          select: {
            tournamentId: true,
            numRounds: true,
          },
        },
      },
    });
  }

  async getCurrentDraft(userId: number, tournamentId: number) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId, tournamentId },
    });
    const draftPlayer = await this.prisma.draftPlayer.findFirstOrThrow({
      where: {
        enrollmentId: {
          in: enrollments.map((enrollment) => enrollment.id),
        },
        draft: {
          started: true,
          finished: false,
        },
      },
      select: {
        id: true,
        draft: {
          select: {
            seated: true,
            id: true,
            started: true,
            finished: true,
            players: {
              select: {
                enrollment: {
                  select: { user: { select: { username: true } } },
                },
                seat: true,
                bye: true,
              },
            },
            cube: {
              select: {
                name: true,
                id: true,
              },
            },
            phase: {
              select: {
                tournamentId: true,
                numRounds: true,
              },
            },
          },
        },
      },
    });

    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ player1Id: draftPlayer.id }, { player2Id: draftPlayer.id }],
      },
      select: {
        round: {
          select: {
            roundIndex: true,
            draft: { select: { phase: { select: { numRounds: true } } } },
          },
        },
        resultConfirmed: true,
      },
    });

    let draft = draftPlayer.draft;
    let checkinNeeded = false;
    let checkoutNeeded = false;

    if (draft.seated) {
      checkinNeeded = true;
      if (matches.length === draft.phase.numRounds) {
        if (matches.at(-1).resultConfirmed) {
          checkinNeeded = true;
          checkoutNeeded = true;
        }
      }
    }

    return { ...draft, checkinNeeded, checkoutNeeded };
  }

  async makeSeatings(draftId: number) {
    let players = await this.prisma.draftPlayer.findMany({
      where: {
        draftId,
      },
      select: { id: true },
    });

    const numPlayers = players.length;

    if (numPlayers <= 0) {
      throw new InternalServerErrorException('No players to seat');
    }

    shuffleArray(players);
    for (const [idx, player] of players.entries()) {
      this.prisma.draftPlayer.update({
        where: {
          id: player.id,
        },
        data: {
          seat: idx + 1,
        },
      });
    }
    return await this.prisma.draft.update({
      where: { id: draftId },
      data: {
        seated: true,
      },
      include: {
        players: {
          select: {
            enrollment: { select: { user: { select: { username: true } } } },
            seat: true,
            bye: true,
            hadBye: true,
          },
        },
        cube: {
          select: {
            name: true,
            id: true,
          },
        },
        phase: {
          select: {
            tournamentId: true,
            numRounds: true,
          },
        },
      },
    });
  }
}

function shuffleArray(arr: any[]) {
  for (let i = arr.length - 1; i >= 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}
