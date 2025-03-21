import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { AuthEntity } from './entities/auth.entity';
import { GoogleLoginDto, LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  login(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  @Post('login/google')
  @ApiOkResponse({ type: AuthEntity })
  async googleLogin(
    @Req() req: Request,
    @Body() googleLoginDto: GoogleLoginDto,
  ) {
    try {
      return await this.authService.googleLogin(req, googleLoginDto);
    } catch (error) {
      throw new BadRequestException(error.response);
    }
  }

  @Post('register')
  @ApiCreatedResponse({ type: AuthEntity })
  async register(@Body() { email, password, username }: RegisterDto) {
    try {
      return await this.authService.register(email, password, username);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Error in registration form',
        },
        HttpStatus.BAD_REQUEST,
        {
          cause: error,
        },
      );
    }
  }

  @Get('status')
  @ApiOkResponse({ type: AuthEntity })
  status(@Req() req: Request) {
    if (!(req.headers && req.headers.authorization)) {
      throw new UnauthorizedException();
    }
    return this.authService.status(req.user['id']);
  }
}
