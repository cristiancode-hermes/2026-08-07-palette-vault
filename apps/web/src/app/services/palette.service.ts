import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface PaletteColors {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  text: string;
}

export interface Palette {
  id: number;
  name: string;
  description: string;
  colors: PaletteColors;
  tags: { id: number; name: string; color: string }[];
  isPublic: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaletteDto {
  name: string;
  description?: string;
  colors: PaletteColors;
  tagIds?: number[];
  isPublic?: boolean;
}

export interface UpdatePaletteDto {
  name?: string;
  description?: string;
  colors?: PaletteColors;
  tagIds?: number[];
  isPublic?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PaletteService {
  private readonly http = inject(HttpClient);
  readonly isLoading = signal(false);

  getAll(search?: string, tag?: string, sort?: string) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (tag) params.set('tag', tag);
    if (sort) params.set('sort', sort);
    const qs = params.toString();
    return this.http.get<Palette[]>(`/api/palettes${qs ? '?' + qs : ''}`);
  }

  getPublic(search?: string, tag?: string) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (tag) params.set('tag', tag);
    const qs = params.toString();
    return this.http.get<Palette[]>(`/api/palettes/public${qs ? '?' + qs : ''}`);
  }

  getById(id: number) {
    return this.http.get<Palette>(`/api/palettes/${id}`);
  }

  create(dto: CreatePaletteDto) {
    return this.http.post<Palette>('/api/palettes', dto);
  }

  update(id: number, dto: UpdatePaletteDto) {
    return this.http.put<Palette>(`/api/palettes/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/palettes/${id}`);
  }

  clone(id: number) {
    return this.http.post<Palette>(`/api/palettes/${id}/clone`, {});
  }
}
