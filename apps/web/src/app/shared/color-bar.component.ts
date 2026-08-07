import { Component, input, computed } from '@angular/core';
import { ColorService } from '../services/color.service';

@Component({
  selector: 'app-color-bar',
  standalone: true,
  template: `
    <div class="color-bar" [style.height]="size() === 'lg' ? '64px' : '32px'">
      @for (color of colors(); track color) {
        <div
          class="color-bar-section"
          [class.color-bar-section-sm]="size() === 'sm'"
          [style.background-color]="color"
          [style.color]="contrastText(color)"
        >
          @if (size() === 'lg') {
            <span>{{ color }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `],
})
export class ColorBarComponent {
  readonly colors = input<string[]>([]);
  readonly size = input<'sm' | 'lg'>('sm');
  private readonly colorService = new ColorService();

  contrastText(hex: string): string {
    return this.colorService.contrastText(hex);
  }
}
