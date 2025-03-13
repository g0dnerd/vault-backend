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
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { DraftPlayerEntity } from './entities/draft-player.entity';
import { DraftPlayersService } from './draft-players.service';
import { CreateDraftPlayerDto } from './dto/create-draft-player.dto';
import { UpdateDraftPlayerDto } from './dto/update-draft-player.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles-guard/roles.guard';
import { Roles } from '../roles-guard/roles.decorator';

@Controller('draft-players')
@ApiTags('draft-players')
export class DraftPlayersController {
  constructor(private readonly draftPlayersService: DraftPlayersService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiCreatedResponse({ type: DraftPlayerEntity })
  create(@Body() createDraftPlayerDto: CreateDraftPlayerDto) {
    return this.draftPlayersService.create(createDraftPlayerDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: DraftPlayerEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const draftPlayer = await this.draftPlayersService.findOne(id);
    if (!draftPlayer) {
      throw new NotFoundException(`DraftPlayer with ID ${id} does not exist.`);
    }
    return draftPlayer;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiCreatedResponse({ type: DraftPlayerEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDraftPlayerDto: UpdateDraftPlayerDto
  ) {
    return this.draftPlayersService.update(id, updateDraftPlayerDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: DraftPlayerEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.draftPlayersService.remove(id);
  }

  @Get('tournament/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: DraftPlayerEntity, isArray: true })
  findByTournament(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.draftPlayersService.findByTournamentFromUser(
      id,
      req.user['id']
    );
  }

  @Get('pool-status/:tournamentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: DraftPlayerEntity })
  getPoolStatus(
    @Req() req: Request,
    @Param('tournamentId', ParseIntPipe) tournamentId: number
  ) {
    return this.draftPlayersService.getPoolStatus(tournamentId, req.user['id']);
  }
}
