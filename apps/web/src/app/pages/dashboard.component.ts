import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaletteService, type Palette } from '../services/palette.service';
import { ToastService } from '../services/toast.service';
import { NavbarComponent } from '../shared/navbar.component';
import { ColorBarComponent } from '../shared/color-bar.component';
import { TagBadgeComponent } from '../shared/tag-badge.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, NavbarComponent, ColorBarComponent, TagBadgeComponent, ConfirmDialogComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">My Palettes</h1>
        <a class="btn btn-primary" routerLink="/palette/new">+ New Palette</a>
      </div>

      <div class="search-bar">
        <input
          class="form-input"
          type="text"
          placeholder="Search palettes..."
          [ngModel]="searchQuery()"
          (ngModelChange)="searchQuery.set($event); onSearch()"
        />
        <select class="form-select" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event); loadPalettes()" style="max-width: 160px;">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
        </select>
      </div>

      @if (isLoading()) {
        <div class="flex-row justify-center" style="padding: var(--sp-3xl);">
          <span class="spinner spinner-lg"></span>
        </div>
      } @else if (palettes().length === 0) {
        <div class="empty-state">
          <div class="empty-state-icon">&#127912;</div>
          <div class="empty-state-title">No palettes yet</div>
          <p class="text-muted">Create your first color palette to get started.</p>
          <a class="btn btn-primary" routerLink="/palette/new" style="margin-top: var(--sp-md);">Create Palette</a>
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
                  <span style="font-size: var(--font-size-caption); color: var(--color-muted);">
                    {{ palette.createdAt | date:'mediumDate' }}
                  </span>
                  <button class="btn btn-ghost btn-sm" (click)="$event.stopPropagation(); deletePalette(palette)" type="button">Delete</button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    @if (showConfirmDelete()) {
      <app-confirm-dialog
        title="Delete Palette"
        [message]="deleteMessage"
        confirmText="Delete"
        (confirm)="confirmDelete()"
        (cancel)="showConfirmDelete.set(false)"
      />
    }
  `,
})
export class DashboardPageComponent {
  private readonly paletteService = inject(PaletteService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly palettes = signal<Palette[]>([]);
  readonly isLoading = signal(false);
  readonly searchQuery = signal('');
  readonly sortBy = signal('newest');
  readonly showConfirmDelete = signal(false);
  readonly deletingPalette = signal<Palette | null>(null);

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  get deleteMessage(): string {
    const name = this.deletingPalette()?.name || 'this palette';
    return 'Are you sure you want to delete "' + name + '"? This cannot be undone.';
  }

  constructor() {
    this.loadPalettes();
  }

  onSearch() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadPalettes(), 300);
  }

  loadPalettes() {
    this.isLoading.set(true);
    this.paletteService.getAll(this.searchQuery() || undefined, undefined, this.sortBy()).subscribe({
      next: (data) => {
        this.palettes.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load palettes');
        this.isLoading.set(false);
      },
    });
  }

  paletteColors(p: Palette): string[] {
    return [p.colors.primary, p.colors.secondary, p.colors.accent, p.colors.surface, p.colors.text];
  }

  viewPalette(id: number) {
    this.router.navigate(['/palette', id]);
  }

  deletePalette(palette: Palette) {
    this.deletingPalette.set(palette);
    this.showConfirmDelete.set(true);
  }

  confirmDelete() {
    const palette = this.deletingPalette();
    if (!palette) return;
    this.paletteService.delete(palette.id).subscribe({
      next: () => {
        this.toast.success('Palette deleted');
        this.palettes.update(p => p.filter(x => x.id !== palette.id));
        this.showConfirmDelete.set(false);
        this.deletingPalette.set(null);
      },
      error: () => this.toast.error('Failed to delete palette'),
    });
  }
}
