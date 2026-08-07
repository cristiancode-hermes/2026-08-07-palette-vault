import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ColorService {
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const clean = hex.replace('#', '');
    if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return null;
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }

  rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  isValidHex(hex: string): boolean {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
  }

  normalizeHex(hex: string): string {
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
      return '#' + clean.split('').map(c => c + c).join('');
    }
    return '#' + clean.toUpperCase();
  }

  /** Return a text color (black or white) that has good contrast with the given bg */
  contrastText(hex: string): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return '#FFFFFF';
    const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
    return luminance > 150 ? '#1A1A2E' : '#FFFFFF';
  }
}
