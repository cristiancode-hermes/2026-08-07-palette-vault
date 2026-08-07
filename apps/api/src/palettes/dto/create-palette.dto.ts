import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  MaxLength,
  ValidateNested,
  IsObject,
  IsIn,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export class ColorsDto {
  @ApiProperty({ example: '#1a1a2e' })
  @Matches(hexColorRegex, { message: 'primary must be a valid hex color (#RRGGBB)' })
  primary: string;

  @ApiProperty({ example: '#16213e' })
  @Matches(hexColorRegex, { message: 'secondary must be a valid hex color (#RRGGBB)' })
  secondary: string;

  @ApiProperty({ example: '#0f3460' })
  @Matches(hexColorRegex, { message: 'accent must be a valid hex color (#RRGGBB)' })
  accent: string;

  @ApiProperty({ example: '#e94560' })
  @Matches(hexColorRegex, { message: 'surface must be a valid hex color (#RRGGBB)' })
  surface: string;

  @ApiProperty({ example: '#ffffff' })
  @Matches(hexColorRegex, { message: 'text must be a valid hex color (#RRGGBB)' })
  text: string;
}

export class CreatePaletteDto {
  @ApiProperty({ example: 'Ocean Blues' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'A calming blue color palette', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: { primary: '#1a1a2e', secondary: '#16213e', accent: '#0f3460', surface: '#e94560', text: '#ffffff' } })
  @ValidateNested()
  @Type(() => ColorsDto)
  @IsObject()
  colors: ColorsDto;

  @ApiProperty({ example: [1, 2], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tags?: number[];

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
