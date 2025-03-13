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
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { MatchEntity } from './entities/match.entity';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles-guard/roles.guard';
import { Roles } from '../roles-guard/roles.decorator';

@Controller('matches')
@ApiTags('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiCreatedResponse({ type: MatchEntity })
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @Get('ongoing/:draftId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: MatchEntity, isArray: true })
  findAll(@Param('draftId', ParseIntPipe) draftId: number) {
    return this.matchesService.findOngoing(draftId);
  }

  @Get('current/:tournamentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: MatchEntity, isArray: true })
  findForDraft(
    @Req() req: Request,
    @Param('tournamentId', ParseIntPipe) tournamentId: number
  ) {
    return this.matchesService.findCurrentForTournament(
      tournamentId,
      req.user['id']
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: MatchEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const match = await this.matchesService.findOne(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} does not exist.`);
    }
    return match;
  }

  @Get('/pair-round/:draftId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiCreatedResponse({ type: MatchEntity, isArray: true })
  async pairRound(@Param('draftId', ParseIntPipe) draftId: number) {
    try {
      return await this.matchesService.pairRound(draftId);
    } catch (error) {
      console.error(JSON.stringify(error));
      return new InternalServerErrorException('Failed to generate pairings');
    }
  }

  @Patch('/report/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: MatchEntity })
  reportResult(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchDto: UpdateMatchDto
  ) {
    return this.matchesService.reportResult(req.user['id'], id, updateMatchDto);
  }

  @Patch('/confirm/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: MatchEntity })
  confirmResult(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchDto: UpdateMatchDto
  ) {
    return this.matchesService.confirmResult(
      req.user['id'],
      id,
      updateMatchDto
    );
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: MatchEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchDto: UpdateMatchDto
  ) {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: MatchEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.remove(id);
  }
}
