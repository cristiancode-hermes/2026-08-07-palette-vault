import { Component, input, output, model, signal, HostListener } from '@angular/core';

export interface ColorOption {
  role: string;
  hex: string;
}

@Component({
  selector: 'app-color-selector-dropdown',
  standalone: true,
  template: `
    <div class="color-selector">
      <button
        class="color-selector-trigger"
        (click)="toggleOpen()"
        type="button"
      >
        <span class="color-selector-dot" [style.background-color]="selectedHex()"></span>
        <span>{{ selectedLabel() }}</span>
        <span style="margin-left: auto; font-size: 0.75rem;">&#9660;</span>
      </button>

      @if (isOpen()) {
        <div class="color-selector-dropdown">
          @for (opt of options(); track opt.role) {
            <div
              class="color-selector-option"
              [class.active]="opt.hex === selectedHex()"
              (click)="selectOption(opt)"
            >
              <span class="color-selector-dot" [style.background-color]="opt.hex"></span>
              <span>{{ opt.role }}</span>
              <span style="margin-left: auto; font-family: var(--font-mono); font-size: 0.75rem;">{{ opt.hex }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: inline-block; }
  `],
})
export class ColorSelectorDropdownComponent {
  readonly options = input<ColorOption[]>([]);
  readonly selectedHex = model<string>('');
  readonly selectedLabel = input<string>('Select color');

  readonly selectionChange = output<string>();

  isOpen = signal(false);

  toggleOpen() {
    this.isOpen.update(v => !v);
  }

  selectOption(opt: ColorOption) {
    this.selectedHex.set(opt.hex);
    this.selectionChange.emit(opt.hex);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.color-selector')) {
      this.isOpen.set(false);
    }
  }
}
