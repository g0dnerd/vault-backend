import { PartialType } from '@nestjs/swagger';
import { CreateDraftPlayerDto } from './create-draft-player.dto';

export class UpdateDraftPlayerDto extends PartialType(CreateDraftPlayerDto) {}
