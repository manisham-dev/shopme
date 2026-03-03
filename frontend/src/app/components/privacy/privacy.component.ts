import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pt-20 min-h-screen bg-background">
      <div class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-4xl font-bold text-white mb-6">Privacy Policy</h1>
        <div class="text-white/80 space-y-4">
          <p>At JewelCart, we value your privacy and are committed to protecting your personal information.</p>
          <p>We collect minimal data necessary for providing our services and do not share your information with third parties.</p>
          <p>For any privacy concerns, please contact us at info&#64;jewelcart.com</p>
        </div>
      </div>
    </div>
  `
})
export class PrivacyComponent {}
