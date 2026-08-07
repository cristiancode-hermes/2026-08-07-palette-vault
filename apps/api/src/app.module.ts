import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PalettesModule } from './palettes/palettes.module';
import { TagsModule } from './tags/tags.module';
import { ExportModule } from './export/export.module';
import { SeedModule } from './seed/seed.module';
import { User } from './entities/user.entity';
import { Palette } from './entities/palette.entity';
import { Tag } from './entities/tag.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data/palette-vault.db',
      entities: [User, Palette, Tag],
      synchronize: true,
    }),
    AuthModule,
    PalettesModule,
    TagsModule,
    ExportModule,
    SeedModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
