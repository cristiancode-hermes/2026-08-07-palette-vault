import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ColorsDto } from '../../palettes/dto/create-palette.dto';

export class ExportColorsDto {
  @ApiProperty({
    example: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      accent: '#0f3460',
      surface: '#e94560',
      text: '#ffffff',
    },
  })
  @ValidateNested()
  @Type(() => ColorsDto)
  @IsObject()
  colors: ColorsDto;
}
