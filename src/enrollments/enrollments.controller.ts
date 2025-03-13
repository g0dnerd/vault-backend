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

import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { Roles } from '../roles-guard/roles.decorator';
import { RolesGuard } from '../roles-guard/roles.guard';

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

  @Get('current')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: EnrollmentEntity, isArray: true })
  findForUser(@Req() req: Request) {
    return this.enrollmentsService.findByUser(req.user['id']);
  }

  @Get('league')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: EnrollmentEntity, isArray: true })
  findAllLeagueEnrollments() {
    return this.enrollmentsService.findAllLeagueEnrollments();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: EnrollmentEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const enrollment = await this.enrollmentsService.findOne(id);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} does not exist.`);
    }
    return enrollment;
  }

  @Get('tournament/:tournamentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'PLAYER_ADMIN'])
  @ApiOkResponse({ type: EnrollmentEntity, isArray: true })
  findForTournament(@Param('tournamentId', ParseIntPipe) tournamentId: number) {
    return this.enrollmentsService.findByTournament(tournamentId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: EnrollmentEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto
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
  @ApiOkResponse({ type: EnrollmentEntity })
  register(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.enroll(req.user['id'], id);
  }
}
