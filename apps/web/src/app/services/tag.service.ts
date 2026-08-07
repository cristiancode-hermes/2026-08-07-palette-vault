import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface CreateTagDto {
  name: string;
  color: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http.get<Tag[]>('/api/tags');
  }

  create(dto: CreateTagDto) {
    return this.http.post<Tag>('/api/tags', dto);
  }

  update(id: number, dto: UpdateTagDto) {
    return this.http.put<Tag>(`/api/tags/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/tags/${id}`);
  }
}
