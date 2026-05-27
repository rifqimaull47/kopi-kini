/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'Coffee' | 'Non Coffee' | 'Tea' | 'Dessert' | 'Snack';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  rating: number;
  description: string;
  category: Category;
  image: string;
  isPopular?: boolean;
  isAvailable: boolean;
}

export interface CustomizeOptions {
  size: 'Regular' | 'Large';
  sweetness: 'Less' | 'Normal' | 'Extra';
  ice: 'No Ice' | 'Less' | 'Normal' | 'Extra Ice';
}

export interface CartItem {
  cartId: string; // Unique ID representing this specific customized item
  menuItem: MenuItem;
  quantity: number;
  customizeOption: CustomizeOptions;
}

export interface PromoCode {
  code: string;
  discountPercentage: number;
  minSpend: number;
  description: string;
}

export interface Order {
  orderId: string;
  invoiceNumber: string;
  customerName: string;
  tableNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'QRIS';
  cashAmountPaid?: number; // for cashier view change calculation
  changeAmount?: number;
  timestamp: string; // ISO date string
  status: 'pending' | 'completed' | 'cancelled';
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  popularItemsCount: Record<string, number>;
  totalTax: number;
}
