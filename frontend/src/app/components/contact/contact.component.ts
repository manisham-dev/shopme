import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pt-20 min-h-screen bg-background">
      <div class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-4xl font-bold text-white mb-6">Contact Us</h1>
        <div class="text-white/80 space-y-4">
          <p><strong>Email:</strong> info&#64;jewelcart.com</p>
          <p><strong>Phone:</strong> 123456789</p>
          <p><strong>Address:</strong> DL</p>
          <p class="mt-6">Our team is available Monday to Friday, 9 AM to 6 PM EST.</p>
        </div>
      </div>
    </div>
  `
})
export class ContactComponent {}
