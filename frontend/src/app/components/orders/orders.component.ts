import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models';
import { formatCurrency } from '../../constants/api.constants';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  formatCurrency = formatCurrency;

  orders: Order[] = [];
  loading = true;

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
