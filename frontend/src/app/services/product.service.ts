import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Product, ProductsResponse } from '../models';
import { AuthService } from './auth.service';
import { API_URLS } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = API_URLS.products;

  private productsSignal = signal<Product[]>([]);
  private featuredSignal = signal<Product[]>([]);
  private categoriesSignal = signal<string[]>([]);
  private loadingSignal = signal<boolean>(false);

  products = this.productsSignal.asReadonly();
  featured = this.featuredSignal.asReadonly();
  categories = this.categoriesSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getProducts(filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
  }): Observable<ProductsResponse> {
    this.loadingSignal.set(true);
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ProductsResponse>(this.apiUrl, { params }).pipe(
      tap(response => {
        debugger;
        this.productsSignal.set(response.products);
        this.loadingSignal.set(false);
      })
    );
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured`).pipe(
      tap(products => this.featuredSignal.set(products))
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`).pipe(
      tap(categories => this.categoriesSignal.set(categories))
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, formData, { headers: this.getHeaders() });
  }
}
