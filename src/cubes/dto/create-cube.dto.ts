import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsPositive,
  IsUrl,
} from 'class-validator';

export class CreateCubeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @ApiProperty()
  name: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty()
  cardNumber: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ required: false })
  creatorId?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @ApiProperty({ required: false })
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @ApiProperty({ required: false })
  longDescription?: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty()
  url: string;

  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({ required: false })
  imageUrl?: string;
}
