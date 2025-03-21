import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty()
  password: string;
}

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  credential: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  g_csrf_token: string;
}
