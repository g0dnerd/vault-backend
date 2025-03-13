/* eslint-disable indent */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsPositive,
  IsInt,
} from 'class-validator';

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @ApiProperty()
  name: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: false })
  public: boolean;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ required: false, nullable: true })
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  playerCapacity: number;

  @IsBoolean()
  @ApiProperty()
  isLeague: boolean;
}
