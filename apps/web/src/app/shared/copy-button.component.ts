import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-copy-button',
  standalone: true,
  template: `
    <button
      class="btn btn-ghost btn-sm"
      (click)="handleCopy()"
      type="button"
      [style.color]="copiedState() ? 'var(--color-success)' : undefined"
    >
      @if (copiedState()) {
        &#10003; Copied
      } @else {
        &#128203; Copy
      }
    </button>
  `,
})
export class CopyButtonComponent {
  readonly text = input('');
  readonly onCopied = output<void>();

  readonly copiedState = signal(false);

  handleCopy() {
    const text = this.text();
    if (!text) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.copiedState.set(true);
        this.onCopied.emit();
        setTimeout(() => this.copiedState.set(false), 2000);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.copiedState.set(true);
      this.onCopied.emit();
      setTimeout(() => this.copiedState.set(false), 2000);
    }
  }
}
