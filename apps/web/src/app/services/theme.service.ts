import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'pv_theme';
  readonly isDark = signal<boolean>(this.loadPreference());

  constructor() {
    this.applyTheme(this.isDark());
    effect(() => {
      const dark = this.isDark();
      localStorage.setItem(this.storageKey, dark ? 'dark' : 'light');
      this.applyTheme(dark);
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }

  setTheme(dark: boolean): void {
    this.isDark.set(dark);
  }

  private loadPreference(): boolean {
    const stored = localStorage.getItem(this.storageKey);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
  }
}
