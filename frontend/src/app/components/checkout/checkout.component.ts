import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { getImageUrl, API_URLS, formatCurrency } from '../../constants/api.constants';
import { forkJoin } from 'rxjs';

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  getImageUrl = getImageUrl;
  formatCurrency = formatCurrency;
  
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
    console.log('Checkout ngOnInit - current cart:', this.cartService.cart());
    console.log('Checkout ngOnInit - itemCount:', this.cartService.itemCount());
    console.log('Checkout ngOnInit - isLoggedIn:', this.authService.isLoggedIn());
    console.log('Checkout ngOnInit - user:', this.authService.user());
    
    this.cartService.getCart().subscribe(cart => {
      console.log('Checkout getCart response:', cart);
      this.cdr.detectChanges();
      if (this.cartService.cart().total === 0) {
        this.router.navigate(['/cart']);
      }
    });

    if (this.authService.isLoggedIn()) {
      console.log('User is logged in, loading user data...');
      this.authService.getCurrentUser().subscribe({
        next: (user) => {
          console.log('Fresh user data:', user);
          this.loadSavedAddress();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading user:', err);
        }
      });
    }
  }

  loadSavedAddress(): void {
    const user = this.authService.user();
    console.log('loadSavedAddress - user:', user);
    if (user) {
      this.shipping.firstName = user.firstName || '';
      this.shipping.lastName = user.lastName || '';
      this.shipping.email = user.email || '';
      this.shipping.phone = user.phone || '';
      this.shipping.address = user.address || '';
      this.shipping.city = user.city || '';
      this.shipping.state = user.state || '';
      this.shipping.zip = user.zipCode || '';
      console.log('Shipping after load:', this.shipping);
    }
  }

  placeOrder(): void {
    if (this.processing()) return;

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    if (!this.validateForm()) {
      this.orderError.set('Please fill in all required fields');
      return;
    }

    this.processing.set(true);
    this.orderError.set('');

    const address = `${this.shipping.address}, ${this.shipping.city}, ${this.shipping.state} ${this.shipping.zip}`;

    const addressSave$ = this.authService.updateAddress({
      firstName: this.shipping.firstName,
      lastName: this.shipping.lastName,
      phone: this.shipping.phone,
      address: this.shipping.address,
      city: this.shipping.city,
      state: this.shipping.state,
      zipCode: this.shipping.zip
    });

    const createOrder$ = this.orderService.createOrder(address);

    forkJoin([addressSave$, createOrder$]).subscribe({
      next: ([, res]) => {
        this.initiateRazorpayPayment(res.orderId);
      },
      error: (err) => {
        console.error('Order creation error:', err);
        this.processing.set(false);
        this.orderError.set(err.error?.message || 'Failed to create order. Please try again.');
      }
    });
  }

  validateForm(): boolean {
    return !!(this.shipping.firstName && 
              this.shipping.lastName && 
              this.shipping.email && 
              this.shipping.phone && 
              this.shipping.address && 
              this.shipping.city && 
              this.shipping.state && 
              this.shipping.zip);
  }

  initiateRazorpayPayment(orderId: number): void {
    this.orderService.getRazorpayKey().subscribe({
      next: (keyRes) => {
        this.orderService.createRazorpayOrder(orderId).subscribe({
          next: (razorpayOrder) => {
            this.openRazorpayCheckout(keyRes.keyId, razorpayOrder, orderId);
          },
          error: () => {
            this.processing.set(false);
            this.orderError.set('Failed to create payment order. Please try again.');
          }
        });
      },
      error: () => {
        this.processing.set(false);
        this.orderError.set('Failed to load payment gateway. Please try again.');
      }
    });
  }

  openRazorpayCheckout(keyId: string, razorpayOrder: { razorpayOrderId: string; amount: number; currency: string }, orderId: number): void {
    const checkRazorpay = () => {
      if (typeof Razorpay === 'undefined') {
        this.processing.set(false);
        this.orderError.set('Payment gateway not loaded. Please refresh the page and try again.');
        return;
      }

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'Shopme',
        description: 'Order Payment',
        order_id: razorpayOrder.razorpayOrderId,
        handler: (response: any) => {
          this.verifyPayment(response, orderId);
        },
        prefill: {
          name: `${this.shipping.firstName} ${this.shipping.lastName}`,
          email: this.shipping.email,
          contact: this.shipping.phone
        },
        theme: {
          color: '#686666'
        },
        modal: {
          ondismiss: () => {
            this.processing.set(false);
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
      rzp.on('payment.failed', (response: any) => {
        this.processing.set(false);
        this.orderError.set(response.error?.description || 'Payment failed. Please try again.');
      });
    };

    if (typeof Razorpay !== 'undefined') {
      checkRazorpay();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof Razorpay !== 'undefined') {
          clearInterval(interval);
          checkRazorpay();
        } else if (attempts >= 10) {
          clearInterval(interval);
          this.processing.set(false);
          this.orderError.set('Payment gateway not loaded. Please refresh the page and try again.');
        }
      }, 500);
    }
  }

  verifyPayment(response: any, orderId: number): void {
    this.orderService.verifyRazorpayPayment(
      response.razorpay_order_id,
      response.razorpay_payment_id,
      response.razorpay_signature,
      orderId
    ).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.router.navigate(['/order-success']);
      },
      error: () => {
        this.processing.set(false);
        this.orderError.set('Payment verification failed. Please try again.');
      }
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = API_URLS.noImage;
  }
}
