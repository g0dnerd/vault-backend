import { Tournament } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class TournamentEntity implements Tournament {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  public: boolean;

  @ApiProperty()
  playerCapacity: number;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty()
  isLeague: boolean;
}
