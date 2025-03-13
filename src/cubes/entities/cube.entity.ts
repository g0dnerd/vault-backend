import { Cube } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CubeEntity implements Cube {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false, nullable: true })
  creatorId: number | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  cardNumber: number;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty({ required: false, nullable: true })
  longDescription: string | null;

  @ApiProperty({ required: false, nullable: true })
  imageUrl: string | null;

  @ApiProperty()
  url: string;
}
