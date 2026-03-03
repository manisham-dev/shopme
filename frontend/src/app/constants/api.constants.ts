import { environment } from '../../environments/environment';

export const API_BASE_URL = environment.apiBaseUrl;
export const API_URLS = {
  auth: `${API_BASE_URL}/api/auth`,
  products: `${API_BASE_URL}/api/products`,
  cart: `${API_BASE_URL}/api/cart`,
  orders: `${API_BASE_URL}/api/orders`,
  payment: `${API_BASE_URL}/api/payment`,
  razorpay: `${API_BASE_URL}/api/razorpay`,
  gokwik: `${API_BASE_URL}/api/gokwik`,
  images: `${API_BASE_URL}/images`,
  noImage: `${API_BASE_URL}/images/no-image.png`
};

export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return API_URLS.noImage;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};
