import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../entities/user.entity';
import { Palette } from '../entities/palette.entity';
import { Tag } from '../entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Palette, Tag])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
