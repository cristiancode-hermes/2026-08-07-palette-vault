import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaletteService, type Palette } from '../services/palette.service';
import { ToastService } from '../services/toast.service';
import { NavbarComponent } from '../shared/navbar.component';
import { ColorBarComponent } from '../shared/color-bar.component';
import { TagBadgeComponent } from '../shared/tag-badge.component';

@Component({
  selector: 'app-explore-page',
  standalone: true,
  imports: [FormsModule, NavbarComponent, ColorBarComponent, TagBadgeComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Explore</h1>
        <span class="text-muted" style="font-size: var(--font-size-body-sm);">Discover public palettes</span>
      </div>

      <div class="search-bar">
        <input
          class="form-input"
          type="text"
          placeholder="Search public palettes..."
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
        />
      </div>

      @if (isLoading()) {
        <div class="flex-row justify-center" style="padding: var(--sp-3xl);">
          <span class="spinner spinner-lg"></span>
        </div>
      } @else if (palettes().length === 0) {
        <div class="empty-state">
          <div class="empty-state-icon">&#128270;</div>
          <div class="empty-state-title">No public palettes found</div>
          <p class="text-muted">No one has shared any palettes yet, or try a different search.</p>
        </div>
      } @else {
        <div class="grid-palettes">
          @for (palette of palettes(); track palette.id) {
            <div class="card" style="cursor: pointer;" (click)="viewPalette(palette.id)">
              <app-color-bar [colors]="paletteColors(palette)" size="sm"></app-color-bar>
              <div style="margin-top: var(--sp-md);">
                <h3 style="font-size: var(--font-size-body); font-weight: var(--font-weight-semibold);">{{ palette.name }}</h3>
                @if (palette.description) {
                  <p class="text-muted" style="font-size: var(--font-size-body-sm); margin-top: var(--sp-xs);">{{ palette.description }}</p>
                }
                @if (palette.tags && palette.tags.length > 0) {
                  <div class="flex-row flex-wrap gap-xs" style="margin-top: var(--sp-sm);">
                    @for (tag of palette.tags; track tag.id) {
                      <app-tag-badge [tag]="tag"></app-tag-badge>
                    }
                  </div>
                }
                <div class="flex-row items-center justify-between" style="margin-top: var(--sp-sm);">
                  <button class="btn btn-sm btn-secondary" (click)="$event.stopPropagation(); clonePalette(palette)" type="button">
                    + Clone
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ExplorePageComponent {
  private readonly paletteService = inject(PaletteService);
  private readonly toast = inject(ToastService);

  readonly palettes = signal<Palette[]>([]);
  readonly isLoading = signal(false);
  readonly searchQuery = signal('');

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadPalettes();
  }

  onSearch() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadPalettes(), 300);
  }

  loadPalettes() {
    this.isLoading.set(true);
    this.paletteService.getPublic(this.searchQuery() || undefined).subscribe({
      next: (data) => {
        this.palettes.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load public palettes');
        this.isLoading.set(false);
      },
    });
  }

  paletteColors(p: Palette): string[] {
    return [p.colors.primary, p.colors.secondary, p.colors.accent, p.colors.surface, p.colors.text];
  }

  viewPalette(id: number) {
    window.open(`/palette/${id}`, '_self');
  }

  clonePalette(palette: Palette) {
    this.paletteService.clone(palette.id).subscribe({
      next: (cloned) => {
        this.toast.success(`Cloned "${palette.name}" to your palettes`);
        window.open(`/palette/${cloned.id}`, '_self');
      },
      error: () => this.toast.error('Failed to clone palette'),
    });
  }
}
