import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateUsernameException extends HttpException {
  constructor() {
    super('This username is already in use.', HttpStatus.CONFLICT);
  }
}

export class DuplicateEmailException extends HttpException {
  constructor() {
    super('This email address is already in use.', HttpStatus.CONFLICT);
  }
}

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Invalid username or password', HttpStatus.UNAUTHORIZED);
  }
}

export class TraditionalLoginWithOauthException extends HttpException {
  constructor() {
    super(
      "Can't use traditional login with Google account.",
      HttpStatus.FORBIDDEN,
    );
  }
}
