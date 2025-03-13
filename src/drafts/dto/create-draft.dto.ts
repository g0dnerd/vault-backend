import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsBoolean, IsOptional } from 'class-validator';

export class CreateDraftDto {
  @IsNumber()
  @ApiProperty()
  phaseId: number;

  @IsNumber()
  @ApiProperty()
  cubeId: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ required: false, default: 0 })
  tableFirst: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ required: false, default: 0 })
  tableLast: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: false })
  started: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: false })
  finished: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: false })
  seated: boolean;
}
