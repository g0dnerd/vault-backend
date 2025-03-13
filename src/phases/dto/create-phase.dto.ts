import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreatePhaseDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty()
  tournamentId: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty()
  phaseIndex: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({ required: false, default: 3 })
  roundAmount: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: false })
  started: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: false })
  finished: boolean;
}
