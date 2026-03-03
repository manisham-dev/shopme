import { Component, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models';
import { API_URLS, getImageUrl, formatCurrency } from '../../constants/api.constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnDestroy {
  getImageUrl = getImageUrl;
  formatCurrency = formatCurrency;
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private subscription = new Subscription();

  product: Product | null = null;
  loading = true;
  quantity = 1;
  productId: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.subscription.add(
      this.route.paramMap.subscribe(params => {
        this.productId = params.get('id');
        console.log('Product ID:', this.productId);
        
        if (this.productId) {
          this.loadProduct(+this.productId);
        }
      })
    );
  }

  private loadProduct(id: number): void {
    console.log('Loading product:', id);
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        console.log('Product fetched:', product);
        this.product = product;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching product:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stockQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product.id, this.quantity).subscribe({
        next: () => {
          this.toastService.success(`${this.product!.name} added to cart!`);
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to add to cart');
        }
      });
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = API_URLS.noImage;
  }
}
