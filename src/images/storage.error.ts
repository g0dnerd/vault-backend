import { HttpException, HttpStatus } from '@nestjs/common';

export class MinioError extends HttpException {
  constructor() {
    super(
      'Error while uploading file, please try again in a little bit.',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
