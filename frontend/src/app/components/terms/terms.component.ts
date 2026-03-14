import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terms-container">
      <div class="terms-content">
        <h1 class="terms-title">Terms of Service</h1>
        <div class="terms-text">
          <p>By using JewelCart, you agree to our terms and conditions.</p>
          <p>All products are subject to availability. We reserve the right to modify pricing and product descriptions at any time.</p>
          <p>For questions about our terms, please contact us.</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./terms.component.css']
})
export class TermsComponent {}
