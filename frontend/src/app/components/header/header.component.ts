import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);

  dropdownOpen = false;
  mobileMenuOpen = false;

  get isLoggedIn(): boolean {
    return !!this.authService.user();
  }

  get isAdmin(): boolean {
    return this.authService.user()?.role === 'ADMIN';
  }

  get cartItemCount(): number {
    const count = this.cartService.itemCount();
    console.log('Header cartItemCount:', count, 'cart:', this.cartService.cart());
    return count;
  }

  get userEmail(): string {
    return this.authService.user()?.email || '';
  }

  get userInitials(): string {
    const user = this.authService.user();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.dropdownOpen = false;
    this.authService.logout();
  }
}
