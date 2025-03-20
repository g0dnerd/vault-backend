import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
  Post,
} from '@nestjs/common';
import { PhasesService } from './phases.service';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PhaseEntity } from './entities/phase.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles-guard/roles.guard';
import { Roles } from '../roles-guard/roles.decorator';
import { CreatePhaseDto } from './dto/create-phase.dto';

@Controller('phases')
@ApiTags('phases')
export class PhasesController {
  constructor(private readonly phasesService: PhasesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'PLAYER_ADMIN'])
  @ApiCreatedResponse({ type: PhaseEntity })
  create(@Body() createPhaseDto: CreatePhaseDto) {
    // return this.phasesService.create(createPhaseDto);
  }

  @Post('no-index')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'PLAYER_ADMIN'])
  @ApiCreatedResponse({ type: PhaseEntity })
  createWithoutPhaseIndex(@Body() data: Partial<CreatePhaseDto>) {
    return this.phasesService.createWithoutPhaseIndex(data);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: PhaseEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const phase = await this.phasesService.findOne(id);
    if (!phase) {
      throw new NotFoundException(`Phase with ID ${id} does not exist.`);
    }
    return phase;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: PhaseEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePhaseDto: UpdatePhaseDto,
  ) {
    return this.phasesService.update(id, updatePhaseDto);
  }

  @Get('tournament/:tournamentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'PLAYER_ADMIN'])
  @ApiOkResponse({ type: PhaseEntity, isArray: true })
  findByTournament(@Param('tournamentId', ParseIntPipe) tournamentId: number) {
    return this.phasesService.findByTournament(tournamentId);
  }
}
