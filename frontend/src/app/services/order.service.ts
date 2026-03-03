import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Order } from '../models';
import { AuthService } from './auth.service';
import { API_URLS } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = API_URLS.orders;
  private paymentUrl = API_URLS.payment;
  private razorpayUrl = API_URLS.payment.replace('/payment', '/razorpay');
  private gokwikUrl = API_URLS.payment.replace('/payment', '/gokwik');

  private ordersSignal = signal<Order[]>([]);
  private currentOrderSignal = signal<Order | null>(null);

  orders = this.ordersSignal.asReadonly();
  currentOrder = this.currentOrderSignal.asReadonly();

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) return new HttpHeaders();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  createOrder(shippingAddress: string): Observable<any> {
    return this.http.post(this.apiUrl, { shippingAddress }, { headers: this.getHeaders() });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(orders => this.ordersSignal.set(orders))
    );
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(order => this.currentOrderSignal.set(order))
    );
  }

  createPaymentIntent(orderId: number): Observable<{ clientSecret: string; paymentIntentId: string }> {
    return this.http.post<{ clientSecret: string; paymentIntentId: string }>(
      `${this.paymentUrl}/create-intent`,
      { orderId },
      { headers: this.getHeaders() }
    );
  }

  confirmPayment(orderId: number, paymentIntentId: string): Observable<any> {
    return this.http.post(
      `${this.paymentUrl}/confirm`,
      { orderId, paymentIntentId },
      { headers: this.getHeaders() }
    );
  }

  createRazorpayOrder(orderId: number): Observable<{ razorpayOrderId: string; amount: number; currency: string }> {
    return this.http.post<{ razorpayOrderId: string; amount: number; currency: string }>(
      `${this.razorpayUrl}/create-order`,
      { orderId },
      { headers: this.getHeaders() }
    );
  }

  verifyRazorpayPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, orderId: number): Observable<any> {
    return this.http.post(
      `${this.razorpayUrl}/verify`,
      { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId },
      { headers: this.getHeaders() }
    );
  }

  getRazorpayKey(): Observable<{ keyId: string }> {
    return this.http.get<{ keyId: string }>(`${this.razorpayUrl}/key`);
  }

  createGokwikOrder(orderId: number): Observable<{ gokwikOrderId: string; amount: number; currency: string; checkoutUrl: string }> {
    return this.http.post<{ gokwikOrderId: string; amount: number; currency: string; checkoutUrl: string }>(
      `${this.gokwikUrl}/create-order`,
      { orderId },
      { headers: this.getHeaders() }
    );
  }

  verifyGokwikPayment(orderId: number, paymentId: string, signature: string): Observable<any> {
    return this.http.post(
      `${this.gokwikUrl}/verify`,
      { orderId, paymentId, signature },
      { headers: this.getHeaders() }
    );
  }

  getGokwikKey(): Observable<{ merchantId: string; apiKey: string }> {
    return this.http.get<{ merchantId: string; apiKey: string }>(`${this.gokwikUrl}/key`);
  }
}
