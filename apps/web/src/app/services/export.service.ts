import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { PaletteColors } from './palette.service';

export interface CssExportResult {
  css: string;
}

export interface TailwindExportResult {
  tailwind: string;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly http = inject(HttpClient);

  exportCss(colors: PaletteColors) {
    return this.http.post<CssExportResult>('/api/export/css', { colors });
  }

  exportTailwind(colors: PaletteColors) {
    return this.http.post<TailwindExportResult>('/api/export/tailwind', { colors });
  }
}
