import { Graph } from '@dagrejs/graphlib';
import { munkres } from 'munkres';

import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MatchGateway } from './matches.gateway';
import { Role } from '@prisma/client';
import { ELO_PROPORTIONALITY } from './matches.module';

interface PlayerScore {
  playerId: string;
  points: number;
  pmw: number;
  pgw: number;
  omw: number;
  ogw: number;
  pairings: Set<string>;
}

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private readonly matchGateway: MatchGateway
  ) {}

  create(createMatchDto: CreateMatchDto) {
    return this.prisma.match.create({ data: createMatchDto });
  }

  findOngoing(draftId: number) {
    return this.prisma.match.findMany({
      where: {
        round: {
          started: true,
          finished: false,
          draftId,
        },
      },
      include: {
        player1: {
          select: {
            enrollment: {
              select: {
                user: { select: { username: true } },
              },
            },
          },
        },
        player2: {
          select: {
            enrollment: {
              select: {
                user: { select: { username: true } },
              },
            },
          },
        },
      },
    });
  }

  async findCurrentForTournament(tournamentId: number, userId: number) {
    const game = await this.prisma.match.findFirst({
      where: {
        round: {
          started: true,
          finished: false,
          draft: {
            started: true,
            finished: false,
            phase: {
              tournamentId,
            },
          },
        },
        OR: [
          {
            player1: {
              enrollment: {
                userId,
              },
            },
          },
          {
            player2: {
              enrollment: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        player1: {
          select: {
            enrollment: {
              select: {
                user: { select: { username: true } },
              },
            },
          },
        },
        player2: {
          select: {
            enrollment: {
              select: {
                user: { select: { username: true } },
              },
            },
          },
        },
      },
    });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const p1Name = game.player1.enrollment.user.username;
    const p2Name = game.player2.enrollment.user.username;
    const opponentName = user.username == p1Name ? p2Name : p1Name;
    return {
      ...game,
      opponentName,
    };
  }

  findOne(id: number) {
    return this.prisma.match.findUnique({
      where: { id },
      include: {
        player1: {
          select: {
            enrollment: { select: { user: { select: { username: true } } } },
          },
        },
        player2: {
          select: {
            enrollment: { select: { user: { select: { username: true } } } },
          },
        },
      },
    });
  }

  async update(id: number, updateMatchDto: UpdateMatchDto) {
    return this.prisma.match.update({ where: { id }, data: updateMatchDto });
  }

  async reportResult(
    userId: number,
    matchId: number,
    updateMatchDto: UpdateMatchDto
  ) {
    // Destructure the updateMatchDto and check if the reporting user
    // is authorized to change this match
    const g = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        player1: { select: { enrollment: { select: { userId: true } } } },
        player2: { select: { enrollment: { select: { userId: true } } } },
      },
    });
    if (
      userId != g.player1.enrollment.userId &&
      userId != g.player2.enrollment.userId
    ) {
      console.error(
        `User with ID ${userId} tried to update match, but players have IDs ${g.player1.enrollment.userId} and ${g.player2.enrollment.userId}`
      );
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      // If the user is not a player in the game, they need to be
      // an admin to be authorized to update the match
      if (!user.roles.includes(Role.ADMIN)) {
        throw new ForbiddenException(
          'User is not authorized to update this match'
        );
      } else {
        // If the user is an admin, the result is automatically confirmed as well
        updateMatchDto = {
          ...updateMatchDto,
          reportedById: null,
          resultConfirmed: true,
        };
      }
    }
    const game = await this.prisma.match.update({
      where: { id: matchId },
      data: updateMatchDto,
    });

    this.matchGateway.handleMatchUpdate(game);
    return game;
  }

  async confirmResult(
    userId: number,
    matchId: number,
    _updateMatchDto: UpdateMatchDto
  ) {
    // Destructure the updateMatchDto and check if the reporting user
    // is authorized to change this match
    const g = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        player1: {
          select: {
            enrollment: { select: { id: true, userId: true, elo: true } },
          },
        },
        player2: {
          select: {
            enrollment: { select: { id: true, userId: true, elo: true } },
          },
        },
      },
    });

    // If the user is not a player in the game, they need to be
    // an admin to be authorized to update the match
    if (
      userId != g.player1.enrollment.userId &&
      userId != g.player2.enrollment.userId
    ) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user.roles.includes(Role.ADMIN)) {
        throw new ForbiddenException(
          'User is not authorized to update this match'
        );
      }
    }

    const game = await this.prisma.match.update({
      where: { id: matchId },
      include: {
        round: {
          select: {
            draft: { select: { phase: { select: { tournament: true } } } },
          },
        },
      },
      data: { resultConfirmed: true },
    });

    const p1Elo = g.player1.enrollment.elo;
    const p2Elo = g.player2.enrollment.elo;

    if (game.round.draft.phase.tournament.isLeague) {
      if (!p1Elo || !p2Elo) {
        throw new InternalServerErrorException('Could not update elo');
      }

      let p1EloNew = 0;
      let p2EloNew = 0;
      let p1WinProb = 0.0;
      let p2WinProb = 0.0;

      if (p1Elo == p2Elo) {
        p1WinProb = 0.5;
        p2WinProb = 0.5;
      } else {
        p1WinProb = 1.0 / (1 + 10 * (Math.abs(p2Elo - p1Elo) / 1135.77));
        p2WinProb = 1.0 - p1WinProb;
      }

      if (game.player1Wins > game.player2Wins) {
        const p1EloGain = p2WinProb * ELO_PROPORTIONALITY;
        p1EloNew = p1Elo + p1EloGain;
        p2EloNew = p2Elo - p1EloGain;
      } else if (game.player1Wins < game.player2Wins) {
        const p2EloGain = p1WinProb * ELO_PROPORTIONALITY;
        p1EloNew = p1Elo - p2EloGain;
        p2EloNew = p2Elo + p2EloGain;
      } else {
        const eloGain = p2WinProb * ELO_PROPORTIONALITY;
        p1EloNew = p1Elo + eloGain / 2;
        p2EloNew = p2Elo - eloGain / 2;
      }

      await this.prisma.enrollment.update({
        where: {
          id: g.player1.enrollment.id,
        },
        data: {
          elo: p1EloNew,
        },
      });
      await this.prisma.enrollment.update({
        where: {
          id: g.player2.enrollment.id,
        },
        data: {
          elo: p2EloNew,
        },
      });
      this.matchGateway.handleMatchUpdate(game);
      return game;
    }

    this.matchGateway.handleMatchUpdate(game);
    return game;
  }

  remove(id: number) {
    return this.prisma.match.delete({ where: { id } });
  }

  async pairRound(draftId: number) {
    const draft = await this.prisma.draft.findUnique({
      where: { id: draftId },
      include: {
        phase: {
          select: { roundAmount: true },
        },
      },
    });

    // Get the latest round
    const existingRounds = await this.prisma.round.findMany({
      where: {
        draftId,
        started: false,
      },
      orderBy: {
        roundIndex: 'asc',
      },
    });

    if (existingRounds.length == 0) {
      throw new InternalServerErrorException('Found no round to pair');
    }

    const currentRound = existingRounds[0];

    let playerScores = await this.getPlayerScores(draftId);
    let pointLists = {};
    let pointTotals = [];
    let countPoints = [];
    let openTable = draft.tableFirst;

    // Organize players by points
    for (const player of playerScores) {
      let found = false;
      for (const p in pointLists) {
        if (p === `${player.points}_1`) {
          found = true;
          break;
        }
      }
      if (!found) {
        pointLists[`${player.points}_1`] = [];
        countPoints[player.points] = 1;
      }
      if (
        pointLists[`${player.points}_${countPoints[player.points]}`].length > 25
      ) {
        countPoints[player.points] += 1;
        pointLists[`${player.points}_${countPoints[player.points]}`] = [];
      }
      pointLists[`${player.points}_${countPoints[player.points]}`].push(player);
    }

    for (const points in pointLists) {
      pointTotals.push(points);
    }

    pointTotals.sort((a, b) => {
      const a_pts = Number(a.split('_')[0]);
      const b_pts = Number(b.split('_')[0]);
      return b_pts - a_pts;
    });

    const matches = [];
    for (const points of pointTotals) {
      const bracketGraph = new Graph();
      pointLists[points].forEach((player: PlayerScore) => {
        bracketGraph.setNode(String(player.playerId), player);
      });

      const nodes = bracketGraph.nodes();
      for (const playerId of nodes) {
        const player: PlayerScore = bracketGraph.node(playerId);
        for (const opponentId of nodes) {
          const opponent: PlayerScore = bracketGraph.node(opponentId);
          if (!player.pairings.has(opponentId) && playerId !== opponentId) {
            let wgt = Math.floor(Math.random() * 9) + 1;
            if (
              player.points > parseInt(points.split('_')[0]) ||
              opponent.points > parseInt(points.split('_')[0])
            ) {
              wgt = 10;
            }
            bracketGraph.setEdge(playerId, opponentId, wgt);
          }
        }
      }

      const pairings = this.getMaxWeightMatching(bracketGraph);

      console.log('Generated pairings ', JSON.stringify(pairings));

      for (const playerId in pairings) {
        if (
          pointLists[points].some(
            (player: PlayerScore) => player.playerId === playerId
          )
        ) {
          const playerIdx = pointLists[points].findIndex(
            (idx: PlayerScore) => idx.playerId === playerId
          );
          pointLists[points][playerIdx].pairings.add(pairings[playerId]);
          matches.push(
            await this.pair(
              currentRound.id,
              pointLists[points].find(
                (player: PlayerScore) => player.playerId === playerId
              )!,
              pointLists[points].find(
                (player: PlayerScore) => player.playerId === pairings[playerId]
              )!,
              openTable
            )
          );
          openTable += 1;
          pointLists[points] = pointLists[points].filter(
            (player: PlayerScore) =>
              player.playerId !== playerId &&
              player.playerId !== pairings[playerId]
          );
        }
      }
      if (pointLists[points].length > 0) {
        if (
          pointTotals.findIndex((p) => p === points) + 1 ==
          pointTotals.length
        ) {
          while (pointLists[points].length > 0) {
            this.assignBye(pointLists[points].pop(0));
          }
        }
      } else {
        const nextPoints =
          pointTotals[pointTotals.findIndex((p) => p === points) + 1];
        while (pointLists[points].length > 0) {
          pointLists[nextPoints].append(pointLists[points].pop(0));
        }
      }
    }

    await this.prisma.round.update({
      where: { id: currentRound.id },
      data: { started: true },
    });
    return matches;
  }

  async getPlayerScores(draftId: number): Promise<PlayerScore[]> {
    const games = await this.prisma.match.findMany({
      where: {
        OR: [{ player1: { draftId } }, { player2: { draftId } }],
      },
      orderBy: {
        round: { roundIndex: 'desc' },
      },
    });
    const players = await this.prisma.draftPlayer.findMany({
      where: {
        draftId,
      },
    });
    let scores = [];
    for (const p of players) {
      const player = await this.prisma.draftPlayer.update({
        where: {
          id: p.id,
        },
        data: {
          bye: false,
        },
      });
      let points = 0;
      let opponentIds = [];
      let matchesPlayed = 0;
      let gamesPlayed = 0;
      let matchesWon = 0;
      let gamesWon = 0;
      for (let game of games) {
        if (player.id === game.player1Id) {
          opponentIds.push(game.player2Id);
          matchesPlayed += 1;
          gamesPlayed += game.player1Wins + game.player2Wins;
          gamesWon += game.player1Wins;
          if (game.player1Wins > game.player2Wins) {
            points += 3;
            matchesWon += 1;
          } else if (game.player1Wins === game.player2Wins) {
            points += 1;
          }
        } else if (player.id === game.player2Id) {
          opponentIds.push(game.player1Id);
          matchesPlayed += 1;
          gamesPlayed += game.player1Wins + game.player2Wins;
          gamesWon += game.player2Wins;
          if (game.player2Wins > game.player1Wins) {
            points += 3;
            matchesWon += 1;
          } else if (game.player1Wins === game.player2Wins) {
            points += 1;
          }
        }
      }
      scores.push({
        playerId: String(player.id),
        score: points,
        matchesPlayed: matchesPlayed,
        gamesPlayed: gamesPlayed,
        opponents: opponentIds,
        pmw: Math.max(matchesWon / matchesPlayed, 0.33),
        pgw: Math.max(gamesWon / gamesPlayed, 0.33),
      });
    }

    let out = [];
    for (const player of scores) {
      let omw_total = 0.0;
      let ogw_total = 0.0;
      let count = 0;
      let pairings = new Set<string>();

      for (const opponentId in player.opponentIds) {
        const opponent = scores.find((opp) => opp.playerId === opponentId);
        if (opponent) {
          pairings.add(String(opponentId));
          count += 1;
          omw_total += opponent.pmw;
          ogw_total += opponent.pgw;
        }
      }
      const playerScore: PlayerScore = {
        playerId: player.playerId,
        points: player.score,
        pmw: player.pmw,
        pgw: player.pgw,
        omw: omw_total / count,
        ogw: ogw_total / count,
        pairings,
      };
      out.push(playerScore);
    }
    return out;
  }

  getMaxWeightMatching(graph: Graph): { [key: string]: string } {
    const costMatrix: number[][] = [];
    const nodes = graph.nodes();

    for (let i = 0; i < nodes.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < nodes.length; j++) {
        const weight = graph.edge(nodes[i], nodes[j]) || 0;
        row.push(-weight);
      }
      costMatrix.push(row);
    }

    const matches = munkres(costMatrix);
    const pairings: { [key: string]: string } = {};
    const pairedPlayers = new Set<string>();

    for (const [row, col] of matches) {
      if (row < nodes.length && col < nodes.length) {
        const player1 = nodes[row];
        const player2 = nodes[col];
        console.log('Looking at p1 ', player1, ' and p2 ', player2);
        if (
          graph.edge(player1, player2) &&
          !pairedPlayers.has(player1) &&
          !pairedPlayers.has(player2)
        ) {
          console.log('Pairing them.');
          pairings[player1] = player2;
          pairedPlayers.add(player1);
          pairedPlayers.add(player2);
        } else {
          console.log('Not pairing them.');
        }
      }
    }

    // Handle unpaired players if necessary
    const unpairedPlayers = nodes.filter(
      (player) => !pairedPlayers.has(player)
    );
    if (unpairedPlayers.length > 0) {
      // Implement logic to pair remaining unpaired players if needed
      // For example, you could pair them randomly or based on their scores
      for (let i = 0; i < unpairedPlayers.length; i += 2) {
        if (i + 1 < unpairedPlayers.length) {
          pairings[unpairedPlayers[i]] = unpairedPlayers[i + 1];
        }
      }
    }

    return pairings;
  }

  async pair(
    roundId: number,
    player1: PlayerScore,
    player2: PlayerScore,
    tableNumber: number
  ) {
    const data: CreateMatchDto = {
      roundId,
      player1Id: Number(player1.playerId),
      player2Id: Number(player2.playerId),
      tableNumber,
    };

    return await this.prisma.match.create({
      data,
      include: {
        player1: {
          select: {
            enrollment: { select: { user: { select: { username: true } } } },
          },
        },
        player2: {
          select: {
            enrollment: { select: { user: { select: { username: true } } } },
          },
        },
      },
    });
  }

  assignBye(player: PlayerScore) {
    return this.prisma.draftPlayer.update({
      where: {
        id: Number(player.playerId),
      },
      data: {
        hadBye: true,
        bye: true,
      },
    });
  }
}
