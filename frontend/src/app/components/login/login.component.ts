import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = false;
  error = '';

  onSubmit(): void {
    if (!this.email || !this.password) return;

    this.loading = true;
    this.error = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.cartService.loadLocalCart();
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}
