import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateDraftPlayerDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty()
  draftId: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty()
  enrollmentId: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  checkedIn?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  checkedOut?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  bye?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  hadBye?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  dropped?: boolean;

  @IsInt()
  @IsOptional()
  @ApiProperty({ required: false })
  seat?: number;
}
