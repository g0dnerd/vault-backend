import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class CreateMatchDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty()
  roundId: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty()
  player1Id: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty()
  player2Id: number;

  @IsNumber()
  @IsInt()
  @IsPositive()
  @ApiProperty()
  tableNumber: number;

  @IsNumber()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  @ApiProperty({ required: false })
  player1Wins?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(0)
  @Max(2)
  @ApiProperty({ required: false })
  player2Wins?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(-1)
  @Max(1)
  @ApiProperty({ required: false })
  result?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  resultConfirmed?: boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  reportedById?: number;
}
