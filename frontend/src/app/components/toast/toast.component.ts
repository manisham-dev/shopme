import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-20 right-4 z-50 flex flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.message) {
        <div 
          class="px-4 py-3 rounded-lg shadow-lg animate-slide-in"
          [class.bg-green-600]="toast.type === 'success'"
          [class.bg-red-600]="toast.type === 'error'"
          [class.bg-blue-600]="toast.type === 'info'"
        >
          <p class="text-white font-medium">{{ toast.message }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
