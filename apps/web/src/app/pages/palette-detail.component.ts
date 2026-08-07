import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaletteService, type Palette } from '../services/palette.service';
import { ContrastService, type ContrastPair } from '../services/contrast.service';
import { ColorService } from '../services/color.service';
import { ExportService } from '../services/export.service';
import { ToastService } from '../services/toast.service';
import { NavbarComponent } from '../shared/navbar.component';
import { ColorBarComponent } from '../shared/color-bar.component';
import { TagBadgeComponent } from '../shared/tag-badge.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { CopyButtonComponent } from '../shared/copy-button.component';

@Component({
  selector: 'app-palette-detail-page',
  standalone: true,
  imports: [RouterLink, NavbarComponent, ColorBarComponent, TagBadgeComponent, CodeBlockComponent, CopyButtonComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      @if (isLoading()) {
        <div class="flex-row justify-center" style="padding: var(--sp-3xl);">
          <span class="spinner spinner-lg"></span>
        </div>
      } @else if (palette()) {
        <div class="page-header">
          <div>
            <h1 class="page-title">{{ palette()!.name }}</h1>
            @if (palette()!.description) {
              <p class="text-muted" style="margin-top: var(--sp-xs);">{{ palette()!.description }}</p>
            }
          </div>
          <div class="flex-row gap-sm">
            <a class="btn btn-secondary" [routerLink]="['/palette', palette()!.id, 'edit']">Edit</a>
            <button class="btn btn-danger" (click)="deletePalette()" type="button">Delete</button>
          </div>
        </div>

        @if (palette()!.tags && palette()!.tags.length > 0) {
          <div class="flex-row flex-wrap gap-xs" style="margin-bottom: var(--sp-lg);">
            @for (tag of palette()!.tags; track tag.id) {
              <app-tag-badge [tag]="tag"></app-tag-badge>
            }
          </div>
        }

        <app-color-bar [colors]="colorArray()" size="lg"></app-color-bar>

        <div class="palette-info">
          @for (color of colorEntries(); track color.key) {
            <div class="palette-info-item palette-preview">
              <span class="palette-info-label">{{ color.key }}</span>
              <div class="flex-row items-center gap-sm">
                <span class="color-swatch" [style.background-color]="color.value"></span>
                <code style="font-size: var(--font-size-body-sm);">{{ color.value }}</code>
              </div>
            </div>
          }
        </div>

        <div class="card" style="margin-bottom: var(--sp-xl);">
          <div class="card-header">
            <span class="card-title">Contrast Analysis</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--sp-sm);">
            @for (pair of contrastPairs(); track pair.foreground + pair.background) {
              <div class="contrast-result" [class.contrast-pass]="pair.grade.aaNormal" [class.contrast-fail]="!pair.grade.aaNormal">
                <span class="color-swatch" [style.background-color]="pair.foreground" style="width: 20px; height: 20px;"></span>
                <span style="font-size: 0.75rem; color: var(--color-muted);">on</span>
                <span class="color-swatch" [style.background-color]="pair.background" style="width: 20px; height: 20px;"></span>
                <span style="font-weight: var(--font-weight-semibold);">{{ pair.ratio }}:1</span>
                <span style="font-size: var(--font-size-caption);">
                  @if (pair.grade.aaa) { AAA }
                  @else if (pair.grade.aaNormal) { AA }
                  @else if (pair.grade.aaLarge) { AA (large) }
                  @else { Fail }
                </span>
              </div>
            }
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">Export</span>
          </div>
          <div class="export-panel">
            <div class="export-tabs">
              <button
                class="export-tab"
                [class.active]="exportFormat() === 'css'"
                (click)="exportFormat.set('css'); exportCode()"
                type="button"
              >CSS Variables</button>
              <button
                class="export-tab"
                [class.active]="exportFormat() === 'tailwind'"
                (click)="exportFormat.set('tailwind'); exportCode()"
                type="button"
              >Tailwind Config</button>
            </div>

            @if (exportResult()) {
              <app-code-block [code]="exportResult()!" [language]="exportFormat()">
                <app-copy-button [text]="exportResult()!" (onCopied)="toast.success('Copied!')" actions />
              </app-code-block>
            }
          </div>
        </div>
      }

      @if (notFound()) {
        <div class="empty-state">
          <div class="empty-state-icon">&#128533;</div>
          <div class="empty-state-title">Palette not found</div>
          <p class="text-muted">The palette you're looking for doesn't exist or has been deleted.</p>
          <a class="btn btn-primary" routerLink="/dashboard" style="margin-top: var(--sp-md);">Go to Dashboard</a>
        </div>
      }
    </div>
  `,
})
export class PaletteDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paletteService = inject(PaletteService);
  private readonly contrastService = inject(ContrastService);
  private readonly colorService = inject(ColorService);
  private readonly exportService = inject(ExportService);
  readonly toast = inject(ToastService);

  readonly palette = signal<Palette | null>(null);
  readonly isLoading = signal(true);
  readonly notFound = signal(false);
  readonly exportFormat = signal<'css' | 'tailwind'>('css');
  readonly exportResult = signal<string | null>(null);

  readonly colorArray = computed(() => {
    const p = this.palette();
    if (!p) return [];
    return [p.colors.primary, p.colors.secondary, p.colors.accent, p.colors.surface, p.colors.text];
  });

  readonly colorEntries = computed(() => {
    const p = this.palette();
    if (!p) return [];
    return Object.entries(p.colors).map(([key, value]) => ({ key, value }));
  });

  readonly contrastPairs = computed<ContrastPair[]>(() => {
    const p = this.palette();
    if (!p) return [];
    return this.contrastService.analyzePalette(p.colors);
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.notFound.set(true);
      this.isLoading.set(false);
      return;
    }

    this.paletteService.getById(id).subscribe({
      next: (p) => {
        this.palette.set(p);
        this.isLoading.set(false);
        this.exportCode();
      },
      error: () => {
        this.notFound.set(true);
        this.isLoading.set(false);
      },
    });
  }

  exportCode() {
    const p = this.palette();
    if (!p) return;

    if (this.exportFormat() === 'css') {
      this.exportService.exportCss(p.colors).subscribe({
        next: (res) => this.exportResult.set(res.css),
        error: () => this.toast.error('Failed to export CSS'),
      });
    } else {
      this.exportService.exportTailwind(p.colors).subscribe({
        next: (res) => this.exportResult.set(res.tailwind),
        error: () => this.toast.error('Failed to export Tailwind config'),
      });
    }
  }

  deletePalette() {
    const p = this.palette();
    if (!p) return;
    this.paletteService.delete(p.id).subscribe({
      next: () => {
        this.toast.success('Palette deleted');
        this.router.navigate(['/dashboard']);
      },
      error: () => this.toast.error('Failed to delete palette'),
    });
  }
}
