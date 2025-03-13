import { PartialType } from '@nestjs/swagger';
import { CreateCubeDto } from './create-cube.dto';

export class UpdateCubeDto extends PartialType(CreateCubeDto) {}
