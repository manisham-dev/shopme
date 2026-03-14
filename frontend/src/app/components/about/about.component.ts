import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-container">
      <div class="about-content">
        <h1 class="about-title">About Us</h1>
        <div class="about-text">
          <p>Welcome to JewelCart, your destination for exquisite jewelry pieces.</p>
          <p>We specialize in curated collections of premium rings, necklaces, earrings, and bracelets.</p>
          <p>Our mission is to help you find the perfect piece that tells your story.</p>
          <a routerLink="/products" class="about-link">Shop Now →</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./about.component.css']
})
export class AboutComponent {}
