import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PalettesController } from './palettes.controller';
import { PalettesService } from './palettes.service';
import { Palette } from '../entities/palette.entity';
import { Tag } from '../entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Palette, Tag])],
  controllers: [PalettesController],
  providers: [PalettesService],
})
export class PalettesModule {}
