import { ApiProperty } from '@nestjs/swagger';
import { ImageType } from '@prisma/client';
import { IsInt, IsNumber, IsPositive, IsUrl } from 'class-validator';

export class CreateImageDto {
  @IsNumber()
  @IsPositive()
  @IsInt()
  @ApiProperty()
  draftPlayerId: number;

  @IsUrl()
  @ApiProperty()
  url: string;

  @ApiProperty()
  imageType: ImageType;
}
