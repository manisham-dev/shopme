import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="pt-20 min-h-screen bg-background">
      <div class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-4xl font-bold text-white mb-6">About Us</h1>
        <div class="text-white/80 space-y-4">
          <p>Welcome to JewelCart, your destination for exquisite jewelry pieces.</p>
          <p>We specialize in curated collections of premium rings, necklaces, earrings, and bracelets.</p>
          <p>Our mission is to help you find the perfect piece that tells your story.</p>
          <a routerLink="/products" class="inline-block mt-6 text-gold hover:underline">Shop Now →</a>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent {}
