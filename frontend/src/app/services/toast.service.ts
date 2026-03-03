import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  toasts = this.toastsSignal.asReadonly();

  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000): void {
    const toast: Toast = { message, type };
    this.toastsSignal.update(toasts => [...toasts, toast]);
    
    setTimeout(() => {
      this.remove(toast);
    }, duration);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  private remove(toast: Toast): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t !== toast));
  }
}
