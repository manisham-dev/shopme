import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="privacy-container">
      <div class="privacy-content">
        <h1 class="privacy-title">Privacy Policy</h1>
        <div class="privacy-text">
          <p>At JewelCart, we value your privacy and are committed to protecting your personal information.</p>
          <p>We collect minimal data necessary for providing our services and do not share your information with third parties.</p>
          <p>For any privacy concerns, please contact us at info&#64;jewelcart.com</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent {}
