import { Request } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
  Inject,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TournamentEntity } from './entities/tournament.entity';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../roles-guard/roles.decorator';
import { RolesGuard } from '../roles-guard/roles.guard';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Controller('tournaments')
@ApiTags('tournaments')
export class TournamentsController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly tournamentsService: TournamentsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'PLAYER_ADMIN'])
  @ApiCreatedResponse({ type: TournamentEntity })
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentsService.create(createTournamentDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: TournamentEntity, isArray: true })
  async findAll(@Req() req: Request) {
    const cacheKey = `user-tournaments-${req.user['id']}`;
    const fromCache = await this.cacheManager.get(cacheKey);
    if (fromCache) return fromCache;

    const tournaments = await this.tournamentsService.findAll(req.user['id']);
    this.cacheManager.set(cacheKey, tournaments, 5000);
    return tournaments;
  }

  @Get('enrolled')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: TournamentEntity, isArray: true })
  async findEnrolled(@Req() req: Request) {
    const cacheKey = `enrolled-tournaments-${req.user['id']}`;
    const fromCache = await this.cacheManager.get(cacheKey);
    if (fromCache) return fromCache;

    const tournaments = await this.tournamentsService.findEnrolled(
      req.user['id'],
    );
    this.cacheManager.set(cacheKey, tournaments, 5000);
    return tournaments;
  }

  @Get('enrolled-leagues')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: TournamentEntity, isArray: true })
  findEnrolledLeagues(@Req() req: Request) {
    return this.tournamentsService.findLeaguesByUser(req.user['id']);
  }

  @Get('available')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: TournamentEntity, isArray: true })
  async findAvailable(@Req() req: Request) {
    return this.tournamentsService.findAvailableForUser(req.user['id']);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: TournamentEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTournamentDto: UpdateTournamentDto,
  ) {
    return this.tournamentsService.update(id, updateTournamentDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: TournamentEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tournamentsService.remove(id);
  }
}
