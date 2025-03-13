import { Round } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RoundEntity implements Round {
  @ApiProperty()
  id: number;

  @ApiProperty()
  draftId: number;

  @ApiProperty()
  roundIndex: number;

  @ApiProperty()
  paired: boolean;

  @ApiProperty()
  started: boolean;

  @ApiProperty()
  finished: boolean;
}
