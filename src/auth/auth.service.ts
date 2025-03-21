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
import { AuthEntity, GoogleAuthEntity } from './entities/auth.entity';
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

  // Attempts to log in a user via Google OAuth2.
  // Verifies that the tokens in the requests cookies and body match and verifies their signatures
  // using Google's public keys. Passwordless login is permitted if google is authoritative for the user's
  // verification.
  async googleLogin(
    req: Request,
    googleLoginDto: GoogleLoginDto,
  ): Promise<AuthEntity> {
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

    const jwksUri = this.configService.get('GOOGLE_PUB_KEY_URI');
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');

    const email = await verifyJwt(credential, clientId, jwksUri);

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

    return {
      token: this.jwtService.sign({ userId: user.id }),
      roles: user.roles,
    };
  }
}

function verifyJwt(
  credential: string,
  clientId: string,
  jwksUri: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = JwksRsa({
      jwksUri,
    });

    // Callback function for fetching public keys for JWT/JWKS verification
    function getKey(
      header: TokenHeader,
      callback: (err: Error | null, key: string) => void,
    ) {
      client.getSigningKey(header.kid, function (err, key) {
        const signingKey = key.getPublicKey();
        callback(err, signingKey);
      });
    }

    jwt.verify(
      credential,
      getKey,
      { algorithms: ['RS256'] },
      function (err, decoded: GoogleAuthEntity) {
        if (err) {
          return reject(new BadRequestException(err.message));
        }

        try {
          const email = verifyDecodedToken(decoded, clientId);
          resolve(email);
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

function verifyDecodedToken(
  decoded: GoogleAuthEntity,
  clientId: string,
): string {
  // Verify that the value of `aud` in the ID token is equal to one of our client IDs
  if (decoded.aud !== clientId) {
    throw new BadRequestException('Client ID mismatch');
  }

  // Verify that the token origin is authentic
  if (
    !['accounts.google.com', 'https://accounts.google.com'].includes(
      decoded.iss,
    )
  ) {
    throw new BadRequestException('ISS mismatch');
  }

  // Verify that the credential expiry timeframe has not passed
  const expiryNum = decoded.exp;
  if (!expiryNum) {
    throw new BadRequestException('Missing expiry timeframe');
  }

  // JWT exp is in seconds, not milliseconds (RFC 7519)
  const expiry = new Date(expiryNum * 1000);
  if (expiry < new Date()) {
    throw new BadRequestException('Credentials expired');
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
    throw new BadRequestException('Missing email address');
  }
  if (
    parsedEmail.endsWith('@gmail.com') ||
    (decoded.email_verified && decoded.hd)
  ) {
    return parsedEmail;
  } else {
    // TODO: Offer a signup flow for non google-verified users
    throw new BadRequestException(
      'Google is not authoritative for user verification',
    );
  }
}
