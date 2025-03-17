import { Request } from 'express';
import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles-guard/roles.guard';
import { Roles } from 'src/roles-guard/roles.decorator';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ isArray: true })
  getRoles(@Req() req: Request) {
    return this.usersService.getRoles(req.user['id']);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  getProfile(@Req() req: Request) {
    return this.usersService.getProfile(req.user['id']);
  }

  @Get('not-enrolled/:tournamentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'PLAYER_ADMIN'])
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  getAvailableForTournament(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
  ) {
    return this.usersService.getAvailableForTournament(tournamentId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  async update(
    @Req() req: Request,
    @Body() data: { email: string; username: string },
  ) {
    return new UserEntity(await this.usersService.update(req.user['id'], data));
  }
}
