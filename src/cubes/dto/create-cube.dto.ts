import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsPositive,
  IsUrl,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

export class CreateCubeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @ApiProperty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty()
  cobraUrl: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(90)
  @Max(9999)
  @ApiProperty({ required: false })
  numCards?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(40)
  @ApiProperty({ required: false })
  shortDescription?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(900)
  @ApiProperty()
  longDescription: string;
}

export class CubeWithFileDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  name: string;

  @IsUrl()
  @IsNotEmpty()
  cobraUrl: string;

  @IsOptional()
  @Type(() => Number)
  numCards?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(40)
  shortDescription?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(900)
  longDescription: string;

  @IsFile()
  @HasMimeType(['image/jpeg', 'image/png'])
  thumbnail: MemoryStoredFile;
}
