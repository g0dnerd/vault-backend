import { ApiProperty } from '@nestjs/swagger';
import { Image, ImageType } from '@prisma/client';

export class ImageEntity implements Image {
  @ApiProperty()
  id: number;

  @ApiProperty()
  draftPlayerId: number;

  @ApiProperty()
  storagePath: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  imageType: ImageType;
}
