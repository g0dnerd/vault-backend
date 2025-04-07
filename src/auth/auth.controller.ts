import { Request } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
  register(@Body() { email, password, username }: RegisterDto) {
    return this.authService.register(email, password, username);
  }

  @Get('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: AuthEntity })
  refreshAuth(@Req() req: Request) {
    return this.authService.refresh(req.user['id']);
  }
}
