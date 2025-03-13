import { ApiProperty } from '@nestjs/swagger';
import { Match } from '@prisma/client';

export class MatchEntity implements Match {
  @ApiProperty()
  id: number;

  @ApiProperty()
  roundId: number;

  @ApiProperty()
  player1Id: number;

  @ApiProperty()
  player2Id: number;

  @ApiProperty()
  tableNumber: number;

  @ApiProperty({ required: false, nullable: true })
  player1Wins: number | null;

  @ApiProperty({ required: false, nullable: true })
  player2Wins: number | null;

  @ApiProperty({ required: false, nullable: true })
  result: number | null;

  @ApiProperty({ required: false, nullable: true })
  reportedById: number | null;

  @ApiProperty({ required: false, nullable: true })
  resultConfirmed: boolean | null;
}
