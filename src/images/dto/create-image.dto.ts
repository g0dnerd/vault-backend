import { ApiProperty } from '@nestjs/swagger';
import { ImageType } from '@prisma/client';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateImageDto {
  @IsNumber()
  @IsPositive()
  @IsInt()
  @ApiProperty()
  draftPlayerId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  storagePath: string;

  @ApiProperty()
  imageType: ImageType;
}
