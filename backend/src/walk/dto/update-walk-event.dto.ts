import { PartialType } from '@nestjs/swagger';
import { CreateWalkEventDto } from './create-walk-event.dto';

export class UpdateWalkEventDto extends PartialType(CreateWalkEventDto) {}
