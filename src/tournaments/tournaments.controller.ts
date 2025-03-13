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
  NotFoundException,
  UseGuards,
  Req,
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

@Controller('tournaments')
@ApiTags('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiCreatedResponse({ type: TournamentEntity })
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentsService.create(createTournamentDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: TournamentEntity, isArray: true })
  findAll() {
    return this.tournamentsService.findAll();
  }

  @Get('public')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: TournamentEntity, isArray: true })
  findAllPublic() {
    return this.tournamentsService.findAll();
  }

  @Get('enrolled')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: TournamentEntity, isArray: true })
  async findEnrolled(@Req() req: Request) {
    return this.tournamentsService.findByUser(req.user['id']);
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

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: TournamentEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const tournament = await this.tournamentsService.findOne(id);
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} does not exist.`);
    }
    return tournament;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: TournamentEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTournamentDto: UpdateTournamentDto
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
