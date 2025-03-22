import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    createUserDto.password = hashedPassword;

    return this.prisma.user.create({ data: createUserDto });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(
    id: number,
    data: { email: string; username: string; bio?: string },
  ) {
    // if (data.password) {
    //   updateUserDto.password = await bcrypt.hash(
    //     updateUserDto.password,
    //     roundsOfHashing
    //   );
    // }

    return this.prisma.user.update({ where: { id }, data });
  }

  async getRoles(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });
    return user.roles;
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, email: true, profilePicture: true, bio: true },
    });
    const tournaments = await this.prisma.tournament.findMany({
      where: {
        enrollments: {
          some: {
            userId,
          },
        },
      },
    });
    const cubes = await this.prisma.cube.findMany({
      where: {
        creatorId: userId,
      },
    });
    const numTournaments = tournaments.length;
    const numCubes = cubes.length;
    return { ...user, numTournaments, numCubes };
  }

  getAvailableForTournament(tournamentId: number) {
    return this.prisma.user.findMany({
      where: {
        enrollments: {
          none: {
            tournamentId,
          },
        },
      },
      select: {
        username: true,
        id: true,
      },
    });
  }
}
