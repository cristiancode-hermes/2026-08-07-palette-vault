import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async findAll(userId: number) {
    return this.tagRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: number, dto: CreateTagDto) {
    const existing = await this.tagRepository.findOne({
      where: { userId, name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Tag with this name already exists');
    }

    const tag = this.tagRepository.create({
      name: dto.name,
      color: dto.color,
      userId: userId,
    }) as any;

    return this.tagRepository.save(tag);
  }

  async update(id: number, userId: number, dto: UpdateTagDto) {
    const tag = await this.tagRepository.findOne({
      where: { id },
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    if (tag.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (dto.name !== undefined) tag.name = dto.name;
    if (dto.color !== undefined) tag.color = dto.color;

    return this.tagRepository.save(tag);
  }

  async delete(id: number, userId: number) {
    const tag = await this.tagRepository.findOne({
      where: { id },
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    if (tag.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.tagRepository.remove(tag);
    return { message: 'Tag deleted' };
  }
}
