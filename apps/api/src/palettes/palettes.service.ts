import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Palette } from '../entities/palette.entity';
import { Tag } from '../entities/tag.entity';
import { CreatePaletteDto } from './dto/create-palette.dto';
import { UpdatePaletteDto } from './dto/update-palette.dto';

@Injectable()
export class PalettesService {
  constructor(
    @InjectRepository(Palette)
    private paletteRepository: Repository<Palette>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async findAll(
    userId: number,
    query: { search?: string; tag?: string; sort?: string },
  ) {
    const qb = this.paletteRepository
      .createQueryBuilder('palette')
      .leftJoinAndSelect('palette.tags', 'tags')
      .where('palette.userId = :userId', { userId });

    if (query.search) {
      qb.andWhere('palette.name LIKE :search', {
        search: `%${query.search}%`,
      });
    }

    if (query.tag) {
      qb.andWhere('tags.name = :tagName', { tagName: query.tag });
    }

    if (query.sort === 'oldest') {
      qb.orderBy('palette.createdAt', 'ASC');
    } else {
      qb.orderBy('palette.createdAt', 'DESC');
    }

    return qb.getMany();
  }

  async findPublic(query: { search?: string; tag?: string }) {
    const qb = this.paletteRepository
      .createQueryBuilder('palette')
      .leftJoinAndSelect('palette.tags', 'tags')
      .leftJoinAndSelect('palette.user', 'user')
      .where('palette.isPublic = :isPublic', { isPublic: true });

    if (query.search) {
      qb.andWhere('palette.name LIKE :search', {
        search: `%${query.search}%`,
      });
    }

    if (query.tag) {
      qb.andWhere('tags.name = :tagName', { tagName: query.tag });
    }

    qb.orderBy('palette.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: number, userId: number) {
    const palette = await this.paletteRepository.findOne({
      where: { id },
      relations: { tags: true },
    });
    if (!palette) {
      throw new NotFoundException('Palette not found');
    }
    if (!palette.isPublic && palette.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return palette;
  }

  async create(userId: number, dto: CreatePaletteDto) {
    let tags: Tag[] = [];
    if (dto.tags && dto.tags.length > 0) {
      tags = await this.tagRepository.findBy({ id: In(dto.tags), userId });
    }

    const colorsJson = JSON.stringify(dto.colors);

    const palette = this.paletteRepository.create({
      name: dto.name,
      description: dto.description || null,
      colors: colorsJson,
      isPublic: dto.isPublic || false,
      userId: userId,
    }) as any;

    const saved = await this.paletteRepository.save(palette);

    if (tags.length > 0) {
      saved.tags = tags;
      await this.paletteRepository.save(saved);
    }

    return this.paletteRepository.findOne({
      where: { id: saved.id },
      relations: { tags: true },
    });
  }

  async update(id: number, userId: number, dto: UpdatePaletteDto) {
    const palette = await this.paletteRepository.findOne({
      where: { id },
    });
    if (!palette) {
      throw new NotFoundException('Palette not found');
    }
    if (palette.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (dto.name !== undefined) palette.name = dto.name;
    if (dto.description !== undefined) palette.description = dto.description;
    if (dto.isPublic !== undefined) palette.isPublic = dto.isPublic;

    if (dto.colors) {
      palette.colors = JSON.stringify(dto.colors);
    }

    await this.paletteRepository.save(palette);

    if (dto.tags !== undefined) {
      let tags: Tag[] = [];
      if (dto.tags.length > 0) {
        tags = await this.tagRepository.findBy({ id: In(dto.tags), userId });
      }
      palette.tags = tags;
      await this.paletteRepository.save(palette);
    }

    return this.paletteRepository.findOne({
      where: { id },
      relations: { tags: true },
    });
  }

  async delete(id: number, userId: number) {
    const palette = await this.paletteRepository.findOne({
      where: { id },
    });
    if (!palette) {
      throw new NotFoundException('Palette not found');
    }
    if (palette.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.paletteRepository.remove(palette);
    return { message: 'Palette deleted' };
  }

  async clone(id: number, userId: number) {
    const original = await this.paletteRepository.findOne({
      where: { id },
      relations: { tags: true },
    });
    if (!original) {
      throw new NotFoundException('Palette not found');
    }
    if (!original.isPublic && original.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const clone = this.paletteRepository.create({
      name: `${original.name} (clone)`,
      description: original.description,
      colors: original.colors,
      isPublic: false,
      userId: userId,
    }) as any;

    const saved = await this.paletteRepository.save(clone);

    if (original.tags && original.tags.length > 0) {
      // Find matching tags for the current user by name
      const tagNames = original.tags.map((t) => t.name);
      const userTags = await this.tagRepository.findBy({
        name: In(tagNames),
        userId,
      });
      if (userTags.length > 0) {
        saved.tags = userTags;
        await this.paletteRepository.save(saved);
      }
    }

    return this.paletteRepository.findOne({
      where: { id: saved.id },
      relations: { tags: true },
    });
  }
}
