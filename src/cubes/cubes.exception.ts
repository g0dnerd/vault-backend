import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateCubeException extends HttpException {
  constructor() {
    super(
      'This cube already exists. Please check your name and CubeCobra URL.',
      HttpStatus.CONFLICT,
    );
  }
}
