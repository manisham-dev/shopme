export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  role?: string;
  createdAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stockQuantity: number;
  isFeatured: boolean;
  createdAt?: string;
}

export interface CartItem {
  id: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Order {
  id: number;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  paymentStatus: string;
  stripePaymentId?: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    imageUrl: string;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
