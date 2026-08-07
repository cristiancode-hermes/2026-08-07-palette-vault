import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Palette } from '../entities/palette.entity';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Palette)
    private paletteRepository: Repository<Palette>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async seed() {
    const count = await this.userRepository.count();
    if (count > 0) {
      this.logger.log('Database already seeded, skipping');
      return;
    }

    this.logger.log('Seeding database...');

    // Create users
    const aliceHash = await bcrypt.hash('password123', 10);
    const bobHash = await bcrypt.hash('password456', 10);

    const alice = this.userRepository.create({
      username: 'alice',
      email: 'alice@example.com',
      password: aliceHash,
    }) as any;
    const savedAlice = await this.userRepository.save(alice);

    const bob = this.userRepository.create({
      username: 'bob',
      email: 'bob@example.com',
      password: bobHash,
    }) as any;
    const savedBob = await this.userRepository.save(bob);

    // Create tags for alice
    const tagsData = [
      { name: 'vintage', color: '#e94560', userId: savedAlice.id },
      { name: 'nature', color: '#2ecc71', userId: savedAlice.id },
      { name: 'ocean', color: '#3498db', userId: savedAlice.id },
      { name: 'sunset', color: '#f39c12', userId: savedAlice.id },
    ];

    const tags: Tag[] = [];
    for (const t of tagsData) {
      const tag = this.tagRepository.create(t) as any;
      tags.push(await this.tagRepository.save(tag));
    }

    // Create palettes for alice with tag relationships
    const palettesData = [
      {
        name: 'Ocean Blues',
        description: 'A calming deep blue color palette inspired by the ocean',
        colors: JSON.stringify({
          primary: '#0a192f',
          secondary: '#172a45',
          accent: '#00b4d8',
          surface: '#112240',
          text: '#ccd6f6',
        }),
        isPublic: true,
        userId: savedAlice.id,
      },
      {
        name: 'Sunset Vibes',
        description: 'Warm sunset colors for a cozy feel',
        colors: JSON.stringify({
          primary: '#2d1b69',
          secondary: '#e94560',
          accent: '#f5a623',
          surface: '#1a1a2e',
          text: '#ffffff',
        }),
        isPublic: true,
        userId: savedAlice.id,
      },
      {
        name: 'Forest Walk',
        description: 'Earthy green tones inspired by nature',
        colors: JSON.stringify({
          primary: '#1b4332',
          secondary: '#2d6a4f',
          accent: '#52b788',
          surface: '#081c15',
          text: '#d8f3dc',
        }),
        isPublic: false,
        userId: savedAlice.id,
      },
      {
        name: 'Retro Mint',
        description: 'A retro-fresh minty palette',
        colors: JSON.stringify({
          primary: '#2c3e50',
          secondary: '#34495e',
          accent: '#1abc9c',
          surface: '#ecf0f1',
          text: '#2c3e50',
        }),
        isPublic: false,
        userId: savedBob.id,
      },
    ];

    for (const p of palettesData) {
      const palette = this.paletteRepository.create(p) as any;
      await this.paletteRepository.save(palette);
    }

    // Link tags to first 2 palettes
    const oceanBlues = await this.paletteRepository.findOne({
      where: { name: 'Ocean Blues' },
    });
    if (oceanBlues) {
      oceanBlues.tags = [tags[2]]; // ocean tag
      await this.paletteRepository.save(oceanBlues);
    }

    const sunsetVibes = await this.paletteRepository.findOne({
      where: { name: 'Sunset Vibes' },
    });
    if (sunsetVibes) {
      sunsetVibes.tags = [tags[3]]; // sunset tag
      await this.paletteRepository.save(sunsetVibes);
    }

    this.logger.log('Database seeded successfully');
  }
}
