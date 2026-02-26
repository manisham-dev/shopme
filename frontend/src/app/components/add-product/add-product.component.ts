import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './add-product.component.html'
})
export class AddProductComponent implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  description = '';
  price: number | null = null;
  category = '';
  stockQuantity: number | null = null;
  isFeatured = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  loading = false;
  error = '';
  success = '';

  categories: string[] = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Watches', 'Pendants'];

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.authService.user()) {
      this.authService.getCurrentUser().subscribe({
        next: () => this.checkAdminAccess(),
        error: () => {
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.checkAdminAccess();
    }
  }

  private checkAdminAccess(): void {
    const user = this.authService.user();
    if (!user || user.role !== 'ADMIN') {
      this.router.navigate(['/']);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (!this.name || !this.price || !this.category) {
      this.error = 'Name, price, and category are required';
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('description', this.description || '');
    formData.append('price', this.price.toString());
    formData.append('category', this.category);
    formData.append('stockQuantity', (this.stockQuantity || 0).toString());
    formData.append('isFeatured', this.isFeatured.toString());

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.productService.createProduct(formData).subscribe({
      next: (product) => {
        this.loading = false;
        this.success = 'Product created successfully!';
        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 403) {
          this.error = 'Admin access required. Please login as admin.';
        } else {
          this.error = err.error?.message || 'Failed to create product';
        }
      }
    });
  }
}
