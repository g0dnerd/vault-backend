import { Request } from 'express';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import JwksRsa, { TokenHeader } from 'jwks-rsa';

import { PrismaService } from '../prisma/prisma.service';
import { AuthEntity } from './entities/auth.entity';
import { UserEntity } from '../users/entities/user.entity';
import { GoogleLoginDto } from './dto/login.dto';

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
    const hashedPassword = await bcrypt.hash(password, 10);
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

  async status(userId: number): Promise<AuthEntity> {
    const user = new UserEntity(
      await this.prisma.user.findUnique({
        where: { id: userId },
      }),
    );
    return {
      token: this.jwtService.sign({ userId: user.id }),
      roles: user.roles,
    };
  }

  async googleLogin(req: Request, googleLoginDto: GoogleLoginDto) {
    // Get the token from the request body
    const { credential, g_csrf_token } = googleLoginDto;

    // Get the token from the request cookie
    const csrfTokenCookie = req.cookies['g_csrf_token'];
    if (!csrfTokenCookie) {
      throw new BadRequestException(
        'Expected CSRF token in request cookie but found none.',
      );
    }

    // Ensure both tokens match
    if (g_csrf_token !== csrfTokenCookie) {
      throw new BadRequestException('Failed to verify double submit cookie.');
    }

    const client = JwksRsa({
      jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
    });

    function getKey(
      header: TokenHeader,
      callback: (err: Error | null, key: string) => void,
    ) {
      client.getSigningKey(header.kid, function (err, key) {
        const signingKey = key.getPublicKey();
        callback(err, signingKey);
      });
    }

    const clientId = this.configService.get('GOOGLE_CLIENT_ID');

    var email = '';

    jwt.verify(
      credential,
      getKey,
      { algorithms: ['RS256'] },
      function (err, decoded: jwt.JwtPayload) {
        if (err) {
          throw new BadRequestException(err.message);
        }

        // Verify that the value of `aud` in the ID token is equal to one of our client IDs
        if (decoded.aud !== clientId) {
          throw new BadRequestException('Client ID mismatch');
        }
        if (
          decoded.iss !== 'accounts.google.com' &&
          decoded.iss !== 'https://accounts.google.com'
        ) {
          throw new BadRequestException('ISS mismatch');
        }

        // Verify that the credential expiry timeframe has not passed
        const exp = decoded.exp;
        if (exp) {
          // JWT exp is in seconds, not milliseconds (RFC 7519)
          const expiry = new Date(exp * 1000);
          if (expiry >= new Date()) {
            throw new BadRequestException('Credentials expired');
          }
        } else {
          throw new BadRequestException('Missing expiry timeframe');
        }

        const parsedEmail = decoded['email'];
        if (!email) {
          throw new BadRequestException('Missing email address');
        }
        email = parsedEmail;
      },
    );

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
    }
  }
}
