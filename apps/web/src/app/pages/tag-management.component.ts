import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TagService, type Tag } from '../services/tag.service';
import { ToastService } from '../services/toast.service';
import { NavbarComponent } from '../shared/navbar.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-tag-management-page',
  standalone: true,
  imports: [FormsModule, NavbarComponent, ConfirmDialogComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Manage Tags</h1>
        <button class="btn btn-primary" (click)="startCreate()" type="button">+ New Tag</button>
      </div>

      @if (showForm()) {
        <div class="card" style="margin-bottom: var(--sp-xl); max-width: 500px;">
          <div class="card-header">
            <span class="card-title">{{ editingTag() ? 'Edit Tag' : 'New Tag' }}</span>
          </div>
          <form (ngSubmit)="saveTag()" style="display: flex; flex-direction: column; gap: var(--sp-md);">
            <div class="form-group">
              <label class="form-label" for="tag-name">Name</label>
              <input
                id="tag-name"
                class="form-input"
                type="text"
                placeholder="e.g. warm, cool, pastel"
                [ngModel]="tagName()"
                (ngModelChange)="tagName.set($event)"
                name="tagName"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="tag-color">Color</label>
              <div class="flex-row items-center gap-sm">
                <input
                  id="tag-color"
                  type="color"
                  [value]="tagColor()"
                  (input)="onColorInput($event)"
                  style="width: 48px; height: 48px; border: 2px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; padding: 2px;"
                />
                <code style="font-size: var(--font-size-body-sm);">{{ tagColor() }}</code>
              </div>
            </div>
            @if (formError()) {
              <span class="form-error">{{ formError() }}</span>
            }
            <div class="flex-row gap-sm">
              <button class="btn btn-primary" type="submit">
                {{ editingTag() ? 'Update' : 'Create' }}
              </button>
              <button class="btn btn-secondary" type="button" (click)="cancelForm()">Cancel</button>
            </div>
          </form>
        </div>
      }

      @if (tags().length === 0) {
        <div class="empty-state">
          <div class="empty-state-icon">&#127991;</div>
          <div class="empty-state-title">No tags yet</div>
          <p class="text-muted">Create tags to organize your palettes.</p>
        </div>
      } @else {
        <div class="grid-tags">
          @for (tag of tags(); track tag.id) {
            <div class="card" style="display: flex; align-items: center; justify-content: space-between;">
              <div class="flex-row items-center gap-sm">
                <span
                  class="color-swatch"
                  [style.background-color]="tag.color"
                  style="width: 20px; height: 20px; border-radius: var(--radius-full);"
                ></span>
                <span style="font-weight: var(--font-weight-medium);">{{ tag.name }}</span>
              </div>
              <div class="flex-row gap-xs">
                <button class="btn btn-ghost btn-sm" (click)="startEdit(tag)" type="button">Edit</button>
                <button class="btn btn-ghost btn-sm" style="color: var(--color-danger);" (click)="startDelete(tag)" type="button">Delete</button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    @if (deletingTag()) {
      <app-confirm-dialog
        title="Delete Tag"
        [message]="deleteMessage"
        confirmText="Delete"
        (confirm)="confirmDelete()"
        (cancel)="deletingTag.set(null)"
      />
    }
  `,
})
export class TagManagementPageComponent {
  private readonly tagService = inject(TagService);
  private readonly toast = inject(ToastService);

  readonly tags = signal<Tag[]>([]);
  readonly showForm = signal(false);
  readonly editingTag = signal<Tag | null>(null);
  readonly deletingTag = signal<Tag | null>(null);
  readonly tagName = signal('');
  readonly tagColor = signal('#6C5CE7');
  readonly formError = signal('');

  get deleteMessage(): string {
    const name = this.deletingTag()?.name || 'this tag';
    return 'Delete tag "' + name + '"? Palettes with this tag won\'t be affected.';
  }

  constructor() {
    this.loadTags();
  }

  onColorInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.tagColor.set(target.value);
  }

  loadTags() {
    this.tagService.getAll().subscribe({
      next: (tags) => this.tags.set(tags),
      error: () => this.toast.error('Failed to load tags'),
    });
  }

  startCreate() {
    this.editingTag.set(null);
    this.tagName.set('');
    this.tagColor.set('#6C5CE7');
    this.formError.set('');
    this.showForm.set(true);
  }

  startEdit(tag: Tag) {
    this.editingTag.set(tag);
    this.tagName.set(tag.name);
    this.tagColor.set(tag.color);
    this.formError.set('');
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingTag.set(null);
    this.tagName.set('');
    this.tagColor.set('#6C5CE7');
    this.formError.set('');
  }

  saveTag() {
    const name = this.tagName().trim();
    if (!name) {
      this.formError.set('Name is required');
      return;
    }

    const dto = { name, color: this.tagColor() };

    if (this.editingTag()) {
      this.tagService.update(this.editingTag()!.id, dto).subscribe({
        next: () => {
          this.toast.success('Tag updated');
          this.loadTags();
          this.cancelForm();
        },
        error: () => this.formError.set('Failed to update tag'),
      });
    } else {
      this.tagService.create(dto).subscribe({
        next: () => {
          this.toast.success('Tag created');
          this.loadTags();
          this.cancelForm();
        },
        error: () => this.formError.set('Failed to create tag'),
      });
    }
  }

  startDelete(tag: Tag) {
    this.deletingTag.set(tag);
  }

  confirmDelete() {
    const tag = this.deletingTag();
    if (!tag) return;
    this.tagService.delete(tag.id).subscribe({
      next: () => {
        this.toast.success('Tag deleted');
        this.tags.update(t => t.filter(x => x.id !== tag.id));
        this.deletingTag.set(null);
      },
      error: () => this.toast.error('Failed to delete tag'),
    });
  }
}
