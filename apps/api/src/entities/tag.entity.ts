import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Palette } from './palette.entity';

@Entity('tags')
@Unique(['userId', 'name'])
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  name: string;

  @Column({ length: 7 })
  color: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.tags)
  user: User;

  @ManyToMany(() => Palette, (palette) => palette.tags)
  palettes: Palette[];

  @CreateDateColumn()
  createdAt: Date;
}
