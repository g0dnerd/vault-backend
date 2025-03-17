import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { Role } from '../roles-guard/role.enum';
import { CreateDraftPlayerDto } from './dto/create-draft-player.dto';
import { UpdateDraftPlayerDto } from './dto/update-draft-player.dto';

@Injectable()
export class DraftPlayersService {
  constructor(private prisma: PrismaService) {}

  create(createDraftPlayerDto: CreateDraftPlayerDto) {
    return this.prisma.draftPlayer.create({ data: createDraftPlayerDto });
  }

  async findAll(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Not authorized to see this resource');
    }
    if (!user.roles.includes(Role.Admin)) {
      return this.findByUser(userId);
    }
    return this.prisma.draftPlayer.findMany();
  }

  findOne(id: number) {
    return this.prisma.draftPlayer.findUnique({ where: { id } });
  }

  update(id: number, updateDraftPlayerDto: UpdateDraftPlayerDto) {
    return this.prisma.draftPlayer.update({
      where: { id },
      data: updateDraftPlayerDto,
    });
  }

  remove(id: number) {
    return this.prisma.draftPlayer.delete({ where: { id } });
  }

  findByTournamentFromUser(tournamentId: number, userId: number) {
    const enrollment = this.prisma.draftPlayer.findFirst({
      where: { enrollment: { userId, tournamentId } },
    });
    if (!enrollment) {
      throw new ForbiddenException();
    }
    return this.prisma.draftPlayer.findMany({
      where: {
        enrollment: {
          tournamentId,
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

  async findByUser(userId: number) {
    return this.prisma.draftPlayer.findMany({
      where: {
        enrollment: {
          userId,
        },
      },
      include: {
        enrollment: true,
      },
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
