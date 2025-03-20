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
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email_verified: boolean;
  nbf: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: string;
  exp: string;
  jti: string;
}
