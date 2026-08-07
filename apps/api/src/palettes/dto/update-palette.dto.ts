import { PartialType } from '@nestjs/swagger';
import { CreatePaletteDto } from './create-palette.dto';

export class UpdatePaletteDto extends PartialType(CreatePaletteDto) {}
