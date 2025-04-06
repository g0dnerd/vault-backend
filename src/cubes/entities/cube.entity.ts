import { Cube } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CubeEntity implements Cube {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false, nullable: true })
  creatorId: number | null;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  numCards: number | null;

  @ApiProperty({ required: false, nullable: true })
  shortDescription: string | null;

  @ApiProperty()
  longDescription: string;

  @ApiProperty({ required: false, nullable: true })
  imageStoragePath: string | null;

  @ApiProperty()
  cobraUrl: string;
}
