import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models';
import { API_URLS, getImageUrl, formatCurrency } from '../../constants/api.constants';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  private subscription: Subscription = new Subscription();
  
  featuredProducts: Product[] = [];
  getImageUrl = getImageUrl;
  formatCurrency = formatCurrency;
  
  categories = [
    { name: 'Rings', image: `${API_URLS.images}/ring1.jpg`, count: 12 },
    { name: 'Necklaces', image: `${API_URLS.images}/necklace1.jpg`, count: 15 },
    { name: 'Earrings', image: `${API_URLS.images}/earring1.jpg`, count: 18 },
    { name: 'Bracelets', image: `${API_URLS.images}/bracelet1.jpg`, count: 10 }
  ];

  ngOnInit(): void {
    this.subscription.add(
      this.productService.getFeaturedProducts().subscribe({
        next: (products) => {
          this.featuredProducts = products;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to load featured products', err)
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = API_URLS.noImage;
  }
}
