import { Component, input } from '@angular/core';

@Component({
  selector: 'app-code-block',
  standalone: true,
  template: `
    <div style="position: relative;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 12px; background-color: var(--color-border); border-radius: var(--radius-md) var(--radius-md) 0 0; font-size: var(--font-size-caption); color: var(--color-ink-secondary);">
        <span>{{ language() }}</span>
        <ng-content select="[actions]"></ng-content>
      </div>
      <textarea
        readonly
        [value]="code()"
        style="width: 100%; min-height: 120px; padding: 12px; font-family: var(--font-mono); font-size: var(--font-size-caption); background-color: var(--color-surface); color: var(--color-ink); border: 1px solid var(--color-border); border-top: none; border-radius: 0 0 var(--radius-md) var(--radius-md); resize: vertical; outline: none; tab-size: 2;"
      ></textarea>
    </div>
  `,
})
export class CodeBlockComponent {
  readonly code = input('');
  readonly language = input('css');
}
