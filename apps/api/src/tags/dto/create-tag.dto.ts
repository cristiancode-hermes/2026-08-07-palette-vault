import { IsString, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'vintage' })
  @IsString()
  @MaxLength(30)
  name: string;

  @ApiProperty({ example: '#e94560' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a valid hex color (#RRGGBB)',
  })
  @MaxLength(7)
  color: string;
}
