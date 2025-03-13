import { ApiProperty } from '@nestjs/swagger';
import { Draft } from '@prisma/client';

export class DraftEntity implements Draft {
  @ApiProperty()
  id: number;

  @ApiProperty()
  phaseId: number;

  @ApiProperty()
  cubeId: number;

  @ApiProperty()
  tableFirst: number;

  @ApiProperty()
  tableLast: number;

  @ApiProperty()
  started: boolean;

  @ApiProperty()
  finished: boolean;

  @ApiProperty()
  seated: boolean;
}
