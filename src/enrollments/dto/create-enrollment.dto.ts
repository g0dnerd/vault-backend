import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty()
  tournamentId: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty()
  userId: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  @ApiProperty()
  elo?: number;
}
