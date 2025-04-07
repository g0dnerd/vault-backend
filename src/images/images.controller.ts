import { Request } from 'express';
import 'multer';
import {
  Controller,
  Get,
  NotFoundException,
  ParseIntPipe,
  Param,
  Post,
  UseGuards,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ImageEntity } from './entities/image.entity';
import { JpegValidator } from './image.validator';

@Controller('images')
@ApiTags('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('user')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ isArray: true })
  findForPlayer(@Req() req: Request) {
    return this.imagesService.findForUser(req.user['id']);
  }

  @Post('upload/checkin/:tournamentId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ImageEntity })
  async uploadCheckinImage(
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1000 * 1000 * 10 })
        .addFileTypeValidator({ fileType: 'image/jpeg' })
        .addValidator(new JpegValidator({}))
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
  ) {
    return this.imagesService.handleUpload(
      file,
      req.user['id'],
      tournamentId,
      true,
    );
  }

  @Post('upload/checkout/:tournamentId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ImageEntity })
  async uploadCheckoutImage(
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1000 * 1000 * 10 })
        .addFileTypeValidator({ fileType: 'image/jpeg' })
        .addValidator(new JpegValidator({}))
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
  ) {
    return this.imagesService.handleUpload(
      file,
      req.user['id'],
      tournamentId,
      false,
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ImageEntity })
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const image = await this.imagesService.findOne(id, req.user['id']);
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} does not exist.`);
    }
    return image;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ImageEntity })
  remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.imagesService.remove(id, req.user['id']);
  }
}
