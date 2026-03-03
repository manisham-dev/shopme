import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { Product, ProductsResponse } from '../../models';
import { API_URLS, getImageUrl, formatCurrency } from '../../constants/api.constants';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private subscription: Subscription = new Subscription();

  products: Product[] = [];
  categories: string[] = ['Rings', 'Necklaces', 'Earrings', 'Bracelets'];
  loading = true;
  totalProducts = 0;
  currentPage = 1;
  totalPages = 1;
  getImageUrl = getImageUrl;
  formatCurrency = formatCurrency;

  searchTerm = '';
  selectedCategory = '';
  minPrice?: number;
  maxPrice?: number;
  featuredOnly = false;
  sortBy = 'created_at-desc';

  ngOnInit(): void {
    this.subscription.add(
      this.productService.getCategories().subscribe({
        next: (cats) => {
          if (cats && cats.length > 0) {
            this.categories = cats;
          }
        },
        error: (err) => console.error('Failed to load categories', err)
      })
    );

    this.subscription.add(
      this.route.queryParams.subscribe(params => {
        console.log('Query params:', params);
        this.selectedCategory = params['category'] || '';
        if (params['featured']) {
          this.featuredOnly = params['featured'] === 'true';
        }
        this.loadProducts();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadProducts(): void {
    this.loading = true;
    const [sort, order] = this.sortBy.split('-');
    console.log('Loading products with category:', this.selectedCategory);

    const params = new URLSearchParams();
    if (this.selectedCategory) params.set('category', this.selectedCategory);
    if (this.searchTerm) params.set('search', this.searchTerm);
    if (this.minPrice) params.set('minPrice', this.minPrice.toString());
    if (this.maxPrice) params.set('maxPrice', this.maxPrice.toString());
    if (this.featuredOnly) params.set('featured', 'true');
    params.set('page', this.currentPage.toString());
    params.set('limit', '12');
    params.set('sort', sort);
    params.set('order', order);

    const url = `${API_URLS.products}?${params.toString()}`;

    this.http.get<ProductsResponse>(url).subscribe({
      next: (res) => {
        console.log('API Response:', res);
        this.products = res.products;
        this.totalProducts = res.pagination.total;
        this.totalPages = res.pagination.totalPages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.featuredOnly = false;
    this.sortBy = 'created_at-desc';
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        this.toastService.success(`${product.name} added to cart!`);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to add to cart');
      }
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = API_URLS.noImage;
  }
}
