import { Component, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class.toast-success]="toast.type === 'success'" [class.toast-error]="toast.type === 'error'" [class.toast-info]="toast.type === 'info'">
          <span style="font-size: 1rem;">
            @if (toast.type === 'success') { &#10003; }
            @else if (toast.type === 'error') { &#10007; }
            @else { &#8505; }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.remove(toast.id)" type="button">&times;</button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
