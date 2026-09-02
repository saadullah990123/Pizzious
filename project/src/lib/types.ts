export type PaymentMethod = 'COD' | 'EASYPAISA' | 'MEEZAN' | 'SADAPAY' | 'JAZZCASH' | 'PAYPAL';

export type PaymentStatus = 
  | 'Pending Verification'
  | 'Paid'
  | 'Pending Payment (COD)'
  | 'Failed / Rejected'
  | 'Refunded';

export type OrderStatus = 
  | 'Pending'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Completed'
  | 'Cancelled';

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface DealItem {
  name: string;
  quantity: number;
  description?: string;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  categorySlug?: string;
  categoryName?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  isDeal: boolean;
  dealItems?: DealItem[];
  isActive: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customizations?: Record<string, any>;
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  menuItemId: number;
  itemName: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  customizations?: Record<string, any>;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryAddress: string;
  deliveryNotes?: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  transactionReference?: string | null;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  id?: number;
  storeName: string;
  logoType: 'svg' | 'image';
  logoUrl?: string | null;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  isDeliveryActive: boolean;
  easyPaisaTitle: string;
  easyPaisaNumber: string;
  meezanTitle: string;
  meezanIban: string;
  meezanAccount: string;
  sadaPayTitle: string;
  sadaPayNumber: string;
  jazzCashTitle: string;
  jazzCashNumber: string;
  payPalEmail: string;
  payPalInstructions: string;
  manualPaymentInstructions: string;
  announcementText: string;
  isAnnouncementActive: boolean;
  heroTitle: string;
  heroSubtitle: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}