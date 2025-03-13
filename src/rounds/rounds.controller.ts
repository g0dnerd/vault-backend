import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { UpdateRoundDto } from './dto/update-round.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RoundEntity } from './entities/round.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles-guard/roles.guard';
import { Roles } from '../roles-guard/roles.decorator';

@Controller('rounds')
@ApiTags('rounds')
export class RoundsController {
  constructor(private readonly roundsService: RoundsService) {}

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: RoundEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const round = await this.roundsService.findOne(id);
    if (!round) {
      throw new NotFoundException(`Round with ID ${id} does not exist.`);
    }
    return round;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: RoundEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoundDto: UpdateRoundDto
  ) {
    return this.roundsService.update(id, updateRoundDto);
  }
}
