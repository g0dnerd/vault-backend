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

export interface GoogleAuthEntity {
  iss?: string | undefined;
  sub?: string | undefined;
  aud?: string | string[] | undefined;
  exp?: number | undefined;
  nbf?: number | undefined;
  iat?: number | undefined;
  jti?: string | undefined;
  email?: string | undefined;
  name?: string | undefined;
  picture?: string | undefined;
  given_name?: string | undefined;
  family_name?: string | undefined;
  email_verified?: boolean | undefined;
  hd?: string | undefined;
}
