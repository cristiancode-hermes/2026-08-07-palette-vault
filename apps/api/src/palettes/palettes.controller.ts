import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { PalettesService } from './palettes.service';
import { CreatePaletteDto } from './dto/create-palette.dto';
import { UpdatePaletteDto } from './dto/update-palette.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Palettes')
@Controller('palettes')
export class PalettesController {
  constructor(private palettesService: PalettesService) {}

  @Get('public')
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tag', required: false })
  findPublic(@Query() query: { search?: string; tag?: string }) {
    return this.palettesService.findPublic(query);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'oldest'] })
  findAll(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('sort') sort?: string,
  ) {
    return this.palettesService.findAll(req.user.id, { search, tag, sort });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.palettesService.findOne(id, req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Request() req: any, @Body() dto: CreatePaletteDto) {
    return this.palettesService.create(req.user.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() dto: UpdatePaletteDto,
  ) {
    return this.palettesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.palettesService.delete(id, req.user.id);
  }

  @Post(':id/clone')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  clone(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.palettesService.clone(id, req.user.id);
  }
}
