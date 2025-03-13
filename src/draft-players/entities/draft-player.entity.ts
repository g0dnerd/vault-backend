import { DraftPlayer } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class DraftPlayerEntity implements DraftPlayer {
  @ApiProperty()
  id: number;

  @ApiProperty()
  checkedIn: boolean;

  @ApiProperty()
  checkedOut: boolean;

  @ApiProperty()
  draftId: number;

  @ApiProperty()
  enrollmentId: number;

  @ApiProperty({ required: false, nullable: true })
  bye: boolean | null;

  @ApiProperty({ required: false, nullable: true })
  hadBye: boolean | null;

  @ApiProperty({ required: false, nullable: true })
  dropped: boolean | null;

  @ApiProperty({ required: false, nullable: true })
  seat: number | null;
}
