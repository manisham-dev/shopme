import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { API_URLS, getImageUrl } from '../../constants/api.constants';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  getImageUrl = getImageUrl;
  
  cart = { items: [] as any[], total: 0, itemCount: 0 };
  
  shipping = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  };

  processing = signal(false);
  paymentError = signal('');
  orderError = signal('');

  async ngOnInit(): Promise<void> {
    this.cartService.getCart().subscribe(cart => {
      this.cart = cart;
      if (cart.total === 0) {
        this.router.navigate(['/cart']);
      }
    });
  }

  placeOrder(): void {
    if (this.processing()) return;

    this.processing.set(true);
    this.orderError.set('');

    const address = `${this.shipping.address}, ${this.shipping.city}, ${this.shipping.state} ${this.shipping.zip}`;

    this.orderService.createOrder(address).subscribe({
      next: (res) => {
        this.orderService.createPaymentIntent(res.orderId).subscribe({
          next: () => {
            this.orderService.confirmPayment(res.orderId, '').subscribe({
              next: () => {
                this.cartService.clearCart().subscribe();
                this.router.navigate(['/orders']);
              },
              error: (err) => {
                this.processing.set(false);
                this.orderError.set('Payment failed. Please try again.');
              }
            });
          },
          error: () => {
            this.processing.set(false);
            this.orderError.set('Failed to initialize payment. Please try again.');
          }
        });
      },
      error: () => {
        this.processing.set(false);
        this.orderError.set('Failed to create order. Please try again.');
      }
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = API_URLS.noImage;
  }
}
