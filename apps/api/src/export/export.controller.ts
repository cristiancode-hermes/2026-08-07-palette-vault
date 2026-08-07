import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { ExportColorsDto } from './dto/export-colors.dto';

@ApiTags('Export')
@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Post('css')
  exportCss(@Body() dto: ExportColorsDto) {
    return this.exportService.toCss(dto.colors);
  }

  @Post('tailwind')
  exportTailwind(@Body() dto: ExportColorsDto) {
    return this.exportService.toTailwind(dto.colors);
  }
}
