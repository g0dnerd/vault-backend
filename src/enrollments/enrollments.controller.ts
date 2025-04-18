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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { Roles } from '../roles-guard/roles.decorator';
import { RolesGuard } from '../roles-guard/roles.guard';
import { CacheTTL } from '@nestjs/cache-manager';

@Controller('enrollments')
@ApiTags('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: EnrollmentEntity })
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  @CacheTTL(3000)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: EnrollmentEntity, isArray: true })
  findForUser(@Req() req: Request) {
    return this.enrollmentsService.findByUser(req.user['id']);
  }

  @Post('enroll-many')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: EnrollmentEntity, isArray: true })
  enrollMany(
    @Body() createEnrollmentDto: { tournamentId: number; userIds: number[] },
  ) {
    return this.enrollmentsService.enrollMany(createEnrollmentDto);
  }

  @Get('draft/:draftId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'PLAYER_ADMIN'])
  @ApiOkResponse({ type: EnrollmentEntity, isArray: true })
  findForDraft(@Param('draftId', ParseIntPipe) draftId: number) {
    return this.enrollmentsService.findByDraft(draftId);
  }

  @Get('standings/:tournamentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: EnrollmentEntity, isArray: true })
  async getTournamentStandings(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
  ) {
    try {
      return await this.enrollmentsService.getTournamentStandings(tournamentId);
    } catch (error) {
      return null;
    }
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: EnrollmentEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: EnrollmentEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }

  @Get('enroll/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: EnrollmentEntity })
  enroll(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.enroll(req.user['id'], id);
  }
}
