import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Tag } from './tag.entity';

@Entity('palettes')
export class Palette {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text' })
  colors: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.palettes)
  user: User;

  @ManyToMany(() => Tag, (tag) => tag.palettes)
  @JoinTable({ name: 'palette_tags' })
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
