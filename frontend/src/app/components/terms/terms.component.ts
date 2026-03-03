import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pt-20 min-h-screen bg-background">
      <div class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-4xl font-bold text-white mb-6">Terms of Service</h1>
        <div class="text-white/80 space-y-4">
          <p>By using JewelCart, you agree to our terms and conditions.</p>
          <p>All products are subject to availability. We reserve the right to modify pricing and product descriptions at any time.</p>
          <p>For questions about our terms, please contact us.</p>
        </div>
      </div>
    </div>
  `
})
export class TermsComponent {}
