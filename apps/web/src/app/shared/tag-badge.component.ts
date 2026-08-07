import { Component, input, output } from '@angular/core';

export interface TagBadgeData {
  id: number;
  name: string;
  color: string;
}

@Component({
  selector: 'app-tag-badge',
  standalone: true,
  template: `
    <span
      class="badge"
      [class.badge-removable]="removable()"
      [style.background-color]="tag()?.color ? (tag().color + '22') : 'transparent'"
      [style.color]="tag()?.color || 'var(--color-ink-secondary)'"
      [style.border]="'1px solid ' + (tag()?.color || 'var(--color-border)')"
    >
      {{ tag()?.name || '' }}
      @if (removable()) {
        <button class="badge-remove" (click)="remove.emit(tag().id)" type="button">&times;</button>
      }
    </span>
  `,
})
export class TagBadgeComponent {
  readonly tag = input.required<TagBadgeData>();
  readonly removable = input(false);
  readonly remove = output<number>();
}
