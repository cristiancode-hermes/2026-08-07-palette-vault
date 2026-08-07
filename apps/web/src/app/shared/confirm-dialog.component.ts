import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="modal-overlay" (click)="cancel.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ title() }}</h3>
        </div>
        <div class="modal-body">
          {{ message() }}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="cancel.emit()" type="button">Cancel</button>
          <button class="btn btn-danger" (click)="confirm.emit()" type="button">{{ confirmText() }}</button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly title = input('Confirm');
  readonly message = input('Are you sure?');
  readonly confirmText = input('Delete');
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
