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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CubesService } from './cubes.service';
import { CreateCubeDto } from './dto/create-cube.dto';
import { UpdateCubeDto } from './dto/update-cube.dto';
import { CubeEntity } from './entities/cube.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles-guard/roles.guard';
import { Roles } from '../roles-guard/roles.decorator';

@Controller('cubes')
@ApiTags('cubes')
export class CubesController {
  constructor(private readonly cubesService: CubesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiCreatedResponse({ type: CubeEntity })
  create(@Body() createCubeDto: CreateCubeDto) {
    return this.cubesService.create(createCubeDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: CubeEntity, isArray: true })
  findAll() {
    return this.cubesService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: CubeEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const cube = await this.cubesService.findOne(id);
    if (!cube) {
      throw new NotFoundException(`Cube with ID ${id} does not exist.`);
    }
    return cube;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: CubeEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCubeDto: UpdateCubeDto
  ) {
    return this.cubesService.update(id, updateCubeDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiOkResponse({ type: CubeEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cubesService.remove(id);
  }
}
