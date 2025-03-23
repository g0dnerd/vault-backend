import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { AuthEntity, GoogleLoginDto } from './entities/auth.entity';
import { roundsOfHashing } from 'src/users/users.service';

const GOOGLE_LOGIN_ERRORS = {
  CLIENT_ID_MISMATCH: 'Client ID mismatch',
  ISSUER_MISMATCH: 'ISS mismatch',
  MISSING_EXPIRY: 'Missing expiry timeframe',
  CREDENTIALS_EXPIRED: 'Credentials expired',
  MISSING_EMAIL: 'Missing email address',
  NON_AUTHORITY: 'Google is not authoritative for user verification',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User not found for email ${email}`);
    }

    if (user.isSocialLogin) {
      throw new BadRequestException(
        'Cannot use traditional auth to authenticate OAuth account',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      token: this.jwtService.sign({ userId: user.id }),
      roles: user.roles,
    };
  }

  async register(
    email: string,
    password: string,
    username: string,
  ): Promise<AuthEntity> {
    const hashedPassword = await bcrypt.hash(password, roundsOfHashing);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });
    return {
      token: this.jwtService.sign({ userId: user.id }),
      roles: user.roles,
    };
  }

  status() {
    return true;
  }

  async refresh(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      token: this.jwtService.sign({ userId: user.id }),
      roles: user.roles,
    };
  }

  async googleLogin(googleLoginDto: GoogleLoginDto): Promise<AuthEntity> {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    verifyGooglePayload(googleLoginDto, clientId);

    const user = await this.findOrCreateSocialUser(googleLoginDto.email);

    return {
      token: this.jwtService.sign({ userId: user.id }),
      roles: user.roles,
    };
  }

  private async findOrCreateSocialUser(email: string) {
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    // If there is no user with these social credentials yet, create one.
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          username: email,
          isSocialLogin: true,
        },
      });
    }

    return user;
  }
}

function verifyGooglePayload(decoded: GoogleLoginDto, clientId: string) {
  // Verify that the value of `aud` in the ID token is equal to one of our client IDs
  if (decoded.aud !== clientId) {
    throw new BadRequestException(GOOGLE_LOGIN_ERRORS.CLIENT_ID_MISMATCH);
  }

  // Verify that the token origin is authentic
  if (
    !['accounts.google.com', 'https://accounts.google.com'].includes(
      decoded.iss,
    )
  ) {
    throw new BadRequestException(GOOGLE_LOGIN_ERRORS.ISSUER_MISMATCH);
  }

  // Verify that the credential expiry timeframe has not passed
  const expiryNum = decoded.exp;
  if (!expiryNum) {
    throw new BadRequestException(GOOGLE_LOGIN_ERRORS.MISSING_EXPIRY);
  }

  // JWT exp is in seconds, not milliseconds (RFC 7519)
  const expiry = new Date(expiryNum * 1000);
  if (expiry < new Date()) {
    throw new BadRequestException(GOOGLE_LOGIN_ERRORS.CREDENTIALS_EXPIRED);
  }

  // Using the email, email_verified and hd fields, you can determine
  // if Google hosts and is authoritative for an email address.
  // In the cases where Google is authoritative, the user is known to be the legitimate account owner,
  // and you may skip password or other challenge methods.
  // Cases where Google is authoritative:
  //   - email has a @gmail.com suffix, this is a Gmail account.
  //   - email_verified is true and hd is set, this is a G Suite account.
  const parsedEmail = decoded.email;
  if (!parsedEmail) {
    throw new BadRequestException(GOOGLE_LOGIN_ERRORS.MISSING_EMAIL);
  }
  if (
    !(
      parsedEmail.endsWith('@gmail.com') ||
      (decoded.email_verified && decoded.hd)
    )
  ) {
    // TODO: Offer a signup flow for non google-verified users
    throw new BadRequestException(GOOGLE_LOGIN_ERRORS.NON_AUTHORITY);
  }
}
