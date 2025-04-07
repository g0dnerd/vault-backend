import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { DraftPlayerEntity } from './entities/draft-player.entity';
import { DraftPlayersService } from './draft-players.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles-guard/roles.guard';
import { Roles } from '../roles-guard/roles.decorator';

@Controller('draft-players')
@ApiTags('draft-players')
export class DraftPlayersController {
  constructor(private readonly draftPlayersService: DraftPlayersService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'PLAYER_ADMIN'])
  findAll() {
    return this.draftPlayersService.findAll();
  }

  @Get('pool-status/:tournamentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: DraftPlayerEntity })
  getPoolStatus(
    @Req() req: Request,
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
  ) {
    return this.draftPlayersService.getPoolStatus(tournamentId, req.user['id']);
  }
}
