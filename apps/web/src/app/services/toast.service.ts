import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<ToastMessage[]>([]);

  private add(type: ToastMessage['type'], message: string, duration: number = 3000) {
    const id = this.nextId++;
    this.toasts.update(t => [...t, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string, duration?: number) {
    this.add('success', message, duration);
  }

  error(message: string, duration?: number) {
    this.add('error', message, duration);
  }

  info(message: string, duration?: number) {
    this.add('info', message, duration);
  }

  remove(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
