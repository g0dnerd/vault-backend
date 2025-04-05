import { ApiProperty } from '@nestjs/swagger';
import { Phase } from '@prisma/client';

export class PhaseEntity implements Phase {
  @ApiProperty()
  id: number;

  @ApiProperty()
  tournamentId: number;

  @ApiProperty()
  phaseIndex: number;

  @ApiProperty()
  numRounds: number;

  @ApiProperty()
  started: boolean;

  @ApiProperty()
  finished: boolean;
}
