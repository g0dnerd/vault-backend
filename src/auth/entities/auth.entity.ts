import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { Role } from '@prisma/client';

export class AuthEntity {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  roles: Role[];
}
