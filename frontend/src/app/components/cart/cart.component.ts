import { Component, OnInit, inject, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models';
import { API_URLS, getImageUrl, formatCurrency } from '../../constants/api.constants';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  getImageUrl = getImageUrl;
  formatCurrency = formatCurrency;

  ngOnInit(): void {
    this.cartService.loadLocalCart();
  }

  increaseQuantity(item: CartItem): void {
    if (item.quantity < item.product.stockQuantity) {
      this.cartService.updateQuantity(item.id, item.quantity + 1).subscribe(() => {
        this.cdr.detectChanges();
      });
    }
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1).subscribe(() => {
        this.cdr.detectChanges();
      });
    }
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId).subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = API_URLS.noImage;
  }
}
