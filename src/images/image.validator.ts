import { FileValidator } from '@nestjs/common';

export class JpegValidator extends FileValidator {
  isValid(file?: Express.Multer.File): boolean | Promise<boolean> {
    // Validate that the first 16 bits of the file
    // are consistent with the JPEG leading bytes 0xFF 0xD8.
    // Anything else is not a valid JSON file and might be malicious data
    // with a changed file extension.
    const magicNumber = file.buffer.readUInt16BE();
    if (magicNumber !== 0xffd8) {
      console.error(
        'Rejecting file upload with MIME type inconsistent to JPEG magic number',
      );
      return false;
    }
    return true;
  }

  buildErrorMessage(file: Express.Multer.File): string {
    return `Rejecting file upload for ${file.originalname} with MIME type inconsistent to JPEG magic number`;
  }
}
