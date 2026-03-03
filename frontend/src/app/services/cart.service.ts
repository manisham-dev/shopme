import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, of, forkJoin, map } from 'rxjs';
import { CartItem, Cart, Product } from '../models';
import { AuthService, authEvents } from './auth.service';
import { API_URLS } from '../constants/api.constants';

interface LocalCartItem {
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = API_URLS.cart;
  private localStorageKey = 'guest_cart';
  private authService = inject(AuthService);

  private cartSignal = signal<Cart>({ items: [], total: 0, itemCount: 0 });

  cart = this.cartSignal.asReadonly();
  itemCount = computed(() => {
    const cart = this.cartSignal();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  });
  total = computed(() => this.cartSignal().total);

  constructor(private http: HttpClient) {
    console.log('CartService constructor - authService ready');
    setTimeout(() => this.initCart(), 0);
    authEvents.login.subscribe(() => this.onLogin());
    authEvents.logout.subscribe(() => this.onLogout());
  }

  private onLogout(): void {
    this.cartSignal.set({ items: [], total: 0, itemCount: 0 });
    localStorage.removeItem(this.localStorageKey);
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) return new HttpHeaders();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private initCart(): void {
    console.log('initCart - isLoggedIn:', this.authService.isLoggedIn());
    if (this.authService.isLoggedIn()) {
      this.fetchServerCart();
    } else {
      this.loadLocalCart();
    }
  }

  private onLogin(): void {
    this.loadLocalCart();
  }

  loadLocalCart(): void {
    const stored = localStorage.getItem(this.localStorageKey);
    let items: LocalCartItem[] = [];
    try {
      items = stored ? JSON.parse(stored) : [];
    } catch (e) {
      items = [];
    }
    console.log('loadLocalCart - user logged in:', this.authService.isLoggedIn(), 'items in localStorage:', items);

    if (!this.authService.isLoggedIn()) {
      if (items.length === 0) {
        this.cartSignal.set({ items: [], total: 0, itemCount: 0 });
        return;
      }
      this.loadLocalCartItems(items);
      return;
    }

    if (items.length === 0) {
      this.fetchServerCart();
      return;
    }

    const requests = items.map(item =>
      this.http.post(this.apiUrl, { productId: item.productId, quantity: item.quantity }, { headers: this.getHeaders() })
    );

    forkJoin(requests).subscribe({
      next: () => {
        localStorage.removeItem(this.localStorageKey);
        this.fetchServerCart();
      },
      error: () => {
        localStorage.removeItem(this.localStorageKey);
        this.fetchServerCart();
      }
    });
  }

  private loadLocalCartItems(items: LocalCartItem[]): void {
    this.http.post<{ items: Product[] }>(`${API_URLS.products}/details`, { productIds: items.map(i => i.productId) })
      .subscribe({
        next: (response) => {
          const cartItems: CartItem[] = response.items.map(product => {
            const localItem = items.find(i => i.productId === product.id);
            return {
              id: product.id,
              quantity: localItem?.quantity || 1,
              product: product
            };
          });
          const total = cartItems.reduce((sum: number, item) => sum + (item.product.price * item.quantity), 0);
          const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
          this.cartSignal.set({ items: cartItems, total, itemCount });
        },
        error: () => {
          this.cartSignal.set({ items: [], total: 0, itemCount: 0 });
        }
      });
  }

  private fetchServerCart(): void {
    this.http.get<Cart>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(cart => {
        console.log('fetchServerCart response:', cart);
        const calculatedItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        console.log('fetchServerCart - calculated itemCount:', calculatedItemCount);
        this.cartSignal.set({
          ...cart,
          itemCount: calculatedItemCount
        });
      }),
      catchError(() => of({ items: [], total: 0, itemCount: 0 }))
    ).subscribe();
  }

  getCart(): Observable<Cart> {
    if (!this.authService.isLoggedIn()) {
      const stored = localStorage.getItem(this.localStorageKey);
      let items: LocalCartItem[] = [];
      try {
        items = stored ? JSON.parse(stored) : [];
      } catch (e) {
        items = [];
      }
      if (items.length === 0) {
        return of({ items: [], total: 0, itemCount: 0 });
      }
      return this.loadLocalCartItemsObs(items);
    }
    this.fetchServerCart();
    return of(this.cartSignal());
  }

  private loadLocalCartItemsObs(items: LocalCartItem[]): Observable<Cart> {
    return this.http.post<{ items: Product[] }>(`${API_URLS.products}/details`, { productIds: items.map(i => i.productId) }).pipe(
      map(response => {
        const cartItems: CartItem[] = response.items.map(product => {
          const localItem = items.find(i => i.productId === product.id);
          return {
            id: product.id,
            quantity: localItem?.quantity || 1,
            product: product
          };
        });
        const total = cartItems.reduce((sum: number, item) => sum + (item.product.price * item.quantity), 0);
        const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const cart = { items: cartItems, total, itemCount };
        this.cartSignal.set(cart);
        return cart;
      }),
      catchError(() => of({ items: [], total: 0, itemCount: 0 }))
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<any> {
    if (!this.authService.isLoggedIn()) {
      return this.addToLocalCart(productId, quantity);
    }
    return this.http.post(this.apiUrl, { productId, quantity }, { headers: this.getHeaders() }).pipe(
      tap(() => this.fetchServerCart())
    );
  }

  private addToLocalCart(productId: number, quantity: number): Observable<any> {
    const stored = localStorage.getItem(this.localStorageKey);
    let items: LocalCartItem[] = stored ? JSON.parse(stored) : [];

    const existingItem = items.find(i => i.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({ productId, quantity });
    }

    localStorage.setItem(this.localStorageKey, JSON.stringify(items));
    this.loadLocalCartItems(items);

    return of({ success: true });
  }

  updateQuantity(itemId: number, quantity: number): Observable<any> {
    if (!this.authService.isLoggedIn()) {
      return this.updateLocalQuantity(itemId, quantity);
    }
    return this.http.put(`${this.apiUrl}/${itemId}`, { quantity }, { headers: this.getHeaders() }).pipe(
      tap(() => this.fetchServerCart())
    );
  }

  private updateLocalQuantity(productId: number, quantity: number): Observable<any> {
    const stored = localStorage.getItem(this.localStorageKey);
    let items: LocalCartItem[] = stored ? JSON.parse(stored) : [];

    const item = items.find(i => i.productId === productId);
    if (item) {
      if (quantity <= 0) {
        items = items.filter(i => i.productId !== productId);
      } else {
        item.quantity = quantity;
      }
    }

    localStorage.setItem(this.localStorageKey, JSON.stringify(items));
    this.loadLocalCartItems(items);

    return of({ success: true });
  }

  removeFromCart(itemId: number): Observable<any> {
    if (!this.authService.isLoggedIn()) {
      return this.removeFromLocalCart(itemId);
    }
    return this.http.delete(`${this.apiUrl}/${itemId}`, { headers: this.getHeaders() }).pipe(
      tap(() => this.fetchServerCart())
    );
  }

  private removeFromLocalCart(productId: number): Observable<any> {
    const stored = localStorage.getItem(this.localStorageKey);
    let items: LocalCartItem[] = stored ? JSON.parse(stored) : [];

    items = items.filter(i => i.productId !== productId);

    localStorage.setItem(this.localStorageKey, JSON.stringify(items));
    this.loadLocalCartItems(items);

    return of({ success: true });
  }

  clearCart(): Observable<any> {
    if (!this.authService.isLoggedIn()) {
      localStorage.removeItem(this.localStorageKey);
      this.cartSignal.set({ items: [], total: 0, itemCount: 0 });
      return of({ success: true });
    }
    return this.http.delete(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(() => this.cartSignal.set({ items: [], total: 0, itemCount: 0 }))
    );
  }
}
