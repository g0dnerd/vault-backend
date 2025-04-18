import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
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
  Inject,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { DraftsService } from './drafts.service';
import { CreateDraftDto } from './dto/create-draft.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { DraftEntity } from './entities/draft.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { Roles } from '../roles-guard/roles.decorator';
import { RolesGuard } from '../roles-guard/roles.guard';

@Controller('drafts')
@ApiTags('drafts')
export class DraftsController {
  constructor(
    private readonly draftsService: DraftsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'PLAYER_ADMIN'])
  @ApiCreatedResponse({ type: DraftEntity })
  create(@Body() createDraftDto: CreateDraftDto) {
    return this.draftsService.create(createDraftDto);
  }

  @Get('current/:tournamentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: DraftEntity })
  async getCurrentDraft(
    @Req() req: Request,
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
  ) {
    const cacheKey = `current-draft-${req.user['id']}`;
    const fromCache = await this.cacheManager.get(cacheKey);
    if (fromCache) return fromCache;

    const currentDraft = await this.draftsService
      .getCurrentDraft(req.user['id'], tournamentId)
      .catch(() => {
        throw new NotFoundException('No draft found for current user');
      });
    this.cacheManager.set(cacheKey, currentDraft, 5000);
    return currentDraft;
  }

  @Get('ongoing/:tournamentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: DraftEntity, isArray: true })
  getOngoingDraftsForTournament(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
  ) {
    return this.draftsService.getOngoingDraftsForTournament(tournamentId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'PLAYER_ADMIN'])
  @ApiOkResponse({ type: DraftEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const draft = await this.draftsService.findOne(id);
    if (!draft) {
      throw new NotFoundException(`Draft with ID ${id} does not exist.`);
    }
    return draft;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'PLAYER_ADMIN'])
  @ApiOkResponse({ type: DraftEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDraftDto: UpdateDraftDto,
  ) {
    return this.draftsService.update(id, updateDraftDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: DraftEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.draftsService.remove(id);
  }

  @Post('make-seatings/:draftId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'PLAYER_ADMIN'])
  @ApiOkResponse({ type: DraftEntity })
  async makeSeatings(@Param('draftId', ParseIntPipe) draftId: number) {
    try {
      return await this.draftsService.makeSeatings(draftId);
    } catch (error) {
      return new InternalServerErrorException();
    }
  }
}
