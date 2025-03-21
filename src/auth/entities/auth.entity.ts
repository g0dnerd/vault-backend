import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

import { Role } from '@prisma/client';

export class AuthEntity {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  roles: Role[];
}

export class GoogleLoginDto {
  @ApiProperty()
  @IsString()
  iss: string;

  @ApiProperty()
  @IsString()
  azp: string | string[];

  @ApiProperty()
  @IsString()
  aud: string | string[];

  @ApiProperty()
  @IsString()
  sub: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsBoolean()
  email_verified: boolean;

  @ApiProperty()
  @IsInt()
  nbf: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  picture: string;

  @ApiProperty()
  @IsString()
  given_name: string;

  @ApiProperty()
  @IsString()
  family_name: string;

  @ApiProperty()
  @IsInt()
  iat: number;

  @ApiProperty()
  @IsInt()
  exp: number;

  @ApiProperty()
  @IsString()
  jti: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  hd?: string;
}
