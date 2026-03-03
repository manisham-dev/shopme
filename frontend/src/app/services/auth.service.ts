import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, Subject } from 'rxjs';
import { User, AuthResponse } from '../models';
import { API_URLS } from '../constants/api.constants';

export const authEvents = {
  login: new Subject<void>(),
  logout: new Subject<void>()
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = API_URLS.auth;
  
  private userSignal = signal<User | null>(null);
  
  user = computed(() => this.userSignal());
  isLoggedIn = computed(() => !!this.userSignal());

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.getCurrentUser().subscribe();
    }
  }

  register(data: { email: string; password: string; firstName?: string; lastName?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.userSignal.set(response.user);
        authEvents.login.next();
      })
    );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.userSignal.set(response.user);
        authEvents.login.next();
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.userSignal.set(null);
    authEvents.logout.next();
    this.router.navigate(['/']);
  }

  getCurrentUser(): Observable<User> {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.get<User>(`${this.apiUrl}/me`, { headers }).pipe(
      tap(user => this.userSignal.set(user)),
      catchError(() => {
        this.logout();
        return of(null as any);
      })
    );
  }

  updateAddress(data: { firstName: string; lastName: string; phone: string; address: string; city: string; state: string; zipCode: string }): Observable<User> {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.put<User>(`${this.apiUrl}/address`, data, { headers }).pipe(
      tap(user => this.userSignal.set(user))
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
