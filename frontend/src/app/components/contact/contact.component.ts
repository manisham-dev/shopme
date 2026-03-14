import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contact-container">
      <div class="contact-content">
        <h1 class="contact-title">Contact Us</h1>
        <div class="contact-info">
          <p><strong>Email:</strong> info&#64;jewelcart.com</p>
          <p><strong>Phone:</strong> 123456789</p>
          <p><strong>Address:</strong> DL</p>
          <p class="contact-hours">Our team is available Monday to Friday, 9 AM to 6 PM EST.</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {}
