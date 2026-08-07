import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaletteService, type Palette, type PaletteColors } from '../services/palette.service';
import { TagService, type Tag } from '../services/tag.service';
import { ColorService } from '../services/color.service';
import { ToastService } from '../services/toast.service';
import { NavbarComponent } from '../shared/navbar.component';
import { ColorBarComponent } from '../shared/color-bar.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-palette-editor-page',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, ColorBarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">{{ isEditing() ? 'Edit Palette' : 'New Palette' }}</h1>
        <a class="btn btn-secondary" routerLink="/dashboard">Cancel</a>
      </div>

      <form (ngSubmit)="save()" style="display: flex; flex-direction: column; gap: var(--sp-xl);">
        <!-- Name & Description -->
        <div style="display: flex; flex-direction: column; gap: var(--sp-md); max-width: 600px;">
          <div class="form-group">
            <label class="form-label" for="palette-name">Name</label>
            <input
              id="palette-name"
              class="form-input"
              type="text"
              placeholder="My Awesome Palette"
              [(ngModel)]="name"
              name="name"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="palette-desc">Description (optional)</label>
            <textarea
              id="palette-desc"
              class="form-textarea"
              placeholder="What's this palette for?"
              [(ngModel)]="description"
              name="description"
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- Color Slots -->
        <div>
          <h3 style="margin-bottom: var(--sp-md);">Colors</h3>
          <div class="color-editor-grid">
            @for (slot of colorSlots; track slot.key) {
              <div class="color-slot">
                <span class="color-swatch-large" [style.background-color]="colors()[slot.key]"></span>
                <span class="form-label">{{ slot.label }}</span>
                <div class="input-wrapper" style="width: 100%;">
                  <span class="input-prefix">#</span>
                  <input
                    class="form-input"
                    type="text"
                    maxlength="6"
                    placeholder="HEX"
                    [value]="colors()[slot.key].replace('#', '')"
                    (input)="updateColor(slot.key, $event)"
                    style="text-transform: uppercase; font-family: var(--font-mono);"
                  />
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Live Preview -->
        <div>
          <h3 style="margin-bottom: var(--sp-md);">Preview</h3>
          <app-color-bar [colors]="colorValuesList()" size="lg"></app-color-bar>
        </div>

        <!-- Tags -->
        <div>
          <h3 style="margin-bottom: var(--sp-md);">Tags</h3>
          @if (allTags().length > 0) {
            <div class="flex-row flex-wrap gap-sm" style="margin-bottom: var(--sp-sm);">
              @for (tag of allTags(); track tag.id) {
                <button
                  class="btn btn-sm"
                  [class.btn-primary]="selectedTagIds().includes(tag.id)"
                  [class.btn-secondary]="!selectedTagIds().includes(tag.id)"
                  (click)="toggleTag(tag.id)"
                  type="button"
                  style="border-radius: var(--radius-full);"
                >
                  {{ tag.name }}
                </button>
              }
            </div>
          } @else {
            <p class="text-muted" style="font-size: var(--font-size-body-sm);">No tags available. <a routerLink="/tags">Create tags</a></p>
          }
        </div>

        <!-- Public toggle -->
        <div class="flex-row items-center gap-sm">
          <input
            type="checkbox"
            id="is-public"
            [checked]="isPublic()"
            (change)="isPublic.set(!isPublic())"
          />
          <label for="is-public" style="font-size: var(--font-size-body-sm);">Make this palette public (visible in Explore)</label>
        </div>

        @if (error()) {
          <span class="form-error">{{ error() }}</span>
        }

        <button class="btn btn-primary btn-lg" type="submit" [disabled]="saving()" style="align-self: flex-start;">
          @if (saving()) {
            <span class="spinner"></span> Saving...
          } @else {
            {{ isEditing() ? 'Save Changes' : 'Create Palette' }}
          }
        </button>
      </form>
    </div>
  `,
})
export class PaletteEditorPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paletteService = inject(PaletteService);
  private readonly tagService = inject(TagService);
  private readonly colorService = inject(ColorService);
  private readonly toast = inject(ToastService);

  readonly colorSlots = [
    { key: 'primary' as const, label: 'Primary' },
    { key: 'secondary' as const, label: 'Secondary' },
    { key: 'accent' as const, label: 'Accent' },
    { key: 'surface' as const, label: 'Surface' },
    { key: 'text' as const, label: 'Text' },
  ];

  readonly name = signal('');
  readonly description = signal('');
  readonly colors = signal<PaletteColors>({
    primary: '#6C5CE7',
    secondary: '#A29BFE',
    accent: '#FDCB6E',
    surface: '#F8F7FF',
    text: '#1A1A2E',
  });
  readonly selectedTagIds = signal<number[]>([]);
  readonly isPublic = signal(false);
  readonly allTags = signal<Tag[]>([]);
  readonly isEditing = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  private editId: number | null = null;

  readonly colorValuesList = computed(() => {
    const c = this.colors();
    return [c.primary, c.secondary, c.accent, c.surface, c.text];
  });

  ngOnInit() {
    this.loadTags();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.isEditing.set(true);
        this.editId = id;
        this.loadPalette(id);
      }
    }
  }

  private loadTags() {
    this.tagService.getAll().subscribe({
      next: (tags) => this.allTags.set(tags),
      error: () => {},
    });
  }

  private loadPalette(id: number) {
    this.paletteService.getById(id).subscribe({
      next: (p) => {
        this.name.set(p.name);
        this.description.set(p.description || '');
        this.colors.set(p.colors);
        this.selectedTagIds.set(p.tags?.map(t => t.id) || []);
        this.isPublic.set(p.isPublic);
      },
      error: () => {
        this.toast.error('Failed to load palette');
        this.router.navigate(['/dashboard']);
      },
    });
  }

  updateColor(key: keyof PaletteColors, event: Event) {
    const input = event.target as HTMLInputElement;
    let hex = '#' + input.value.toUpperCase();
    if (this.colorService.isValidHex(hex)) {
      this.colors.update(c => ({ ...c, [key]: hex }));
    } else if (input.value.length >= 6) {
      // Try to auto-correct
      const fullHex = '#' + input.value.slice(0, 6);
      if (this.colorService.isValidHex(fullHex)) {
        this.colors.update(c => ({ ...c, [key]: fullHex }));
      }
    }
  }

  toggleTag(tagId: number) {
    this.selectedTagIds.update(ids =>
      ids.includes(tagId) ? ids.filter(id => id !== tagId) : [...ids, tagId]
    );
  }

  save() {
    if (!this.name().trim()) {
      this.error.set('Please enter a palette name');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const dto = {
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      colors: this.colors(),
      tagIds: this.selectedTagIds(),
      isPublic: this.isPublic(),
    };

    const request = this.isEditing() && this.editId
      ? this.paletteService.update(this.editId, dto)
      : this.paletteService.create(dto);

    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (palette) => {
        this.toast.success(this.isEditing() ? 'Palette updated!' : 'Palette created!');
        this.router.navigate(['/palette', palette.id]);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to save palette');
      },
    });
  }
}
