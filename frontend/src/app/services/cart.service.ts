import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { CartItem, Cart } from '../models';
import { AuthService } from './auth.service';
import { API_URLS } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = API_URLS.cart;

  private cartSignal = signal<Cart>({ items: [], total: 0, itemCount: 0 });

  cart = this.cartSignal.asReadonly();
  itemCount = computed(() => this.cartSignal().itemCount);
  total = computed(() => this.cartSignal().total);

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getCart(): Observable<Cart> {
    if (!this.authService.isLoggedIn()) {
      return of({ items: [], total: 0, itemCount: 0 });
    }
    return this.http.get<Cart>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(cart => this.cartSignal.set(cart)),
      catchError(() => of({ items: [], total: 0, itemCount: 0 }))
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<any> {
    return this.http.post(this.apiUrl, { productId, quantity }, { headers: this.getHeaders() }).pipe(
      tap(() => this.getCart().subscribe())
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${itemId}`, { quantity }, { headers: this.getHeaders() }).pipe(
      tap(() => this.getCart().subscribe())
    );
  }

  removeFromCart(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${itemId}`, { headers: this.getHeaders() }).pipe(
      tap(() => this.getCart().subscribe())
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(() => this.cartSignal.set({ items: [], total: 0, itemCount: 0 }))
    );
  }
}
