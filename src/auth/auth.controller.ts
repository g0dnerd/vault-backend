import { Request } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { AuthEntity, GoogleLoginDto } from './entities/auth.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

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
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    try {
      return await this.authService.googleLogin(googleLoginDto);
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
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  status() {
    return this.authService.status();
  }

  @Get('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: AuthEntity })
  refreshAuth(@Req() req: Request) {
    return this.authService.refresh(req.user['id']);
  }
}
