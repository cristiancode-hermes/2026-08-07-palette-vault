import { Injectable, computed, signal } from '@angular/core';

export interface ContrastGrade {
  aaNormal: boolean;
  aaLarge: boolean;
  aaa: boolean;
}

export interface ContrastPair {
  foreground: string;
  background: string;
  ratio: number;
  grade: ContrastGrade;
}

@Injectable({ providedIn: 'root' })
export class ContrastService {
  private hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return [r, g, b];
  }

  private relativeLuminance(r: number, g: number, b: number): number {
    const linearize = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
  }

  contrastRatio(hex1: string, hex2: string): number {
    const [r1, g1, b1] = this.hexToRgb(hex1);
    const [r2, g2, b2] = this.hexToRgb(hex2);
    const l1 = this.relativeLuminance(r1, g1, b1);
    const l2 = this.relativeLuminance(r2, g2, b2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  getWcagGrade(ratio: number): ContrastGrade {
    return {
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3.0,
      aaa: ratio >= 7.0,
    };
  }

  analyzePair(foreground: string, background: string): ContrastPair {
    const ratio = this.contrastRatio(foreground, background);
    return {
      foreground,
      background,
      ratio: Math.round(ratio * 100) / 100,
      grade: this.getWcagGrade(ratio),
    };
  }

  /** Analyze all meaningful text-on-background pairs in a palette */
  analyzePalette(colors: { primary: string; secondary: string; accent: string; surface: string; text: string }): ContrastPair[] {
    return [
      this.analyzePair(colors.text, colors.surface),
      this.analyzePair(colors.text, colors.primary),
      this.analyzePair(colors.text, colors.secondary),
      this.analyzePair(colors.text, colors.accent),
      this.analyzePair(colors.primary, colors.surface),
      this.analyzePair(colors.secondary, colors.surface),
      this.analyzePair(colors.accent, colors.surface),
    ];
  }
}
