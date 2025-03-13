import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoundDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty()
  draftId: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty()
  roundIndex: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: false })
  paired: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: false })
  started: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: false })
  finished: boolean;
}
