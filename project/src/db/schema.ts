import { pgTable, serial, text, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  salePrice: integer('sale_price'),
  images: jsonb('images').$type<string[]>().default([]).notNull(),
  isDeal: boolean('is_deal').default(false).notNull(),
  dealItems: jsonb('deal_items').$type<{ name: string; quantity: number; description?: string }[]>().default([]),
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isBestseller: boolean('is_bestseller').default(false).notNull(),
  stock: integer('stock').default(100).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Every menu/category-filtered query (storefront category tabs, admin
  // "items in category X") filters on this foreign key — Postgres does not
  // index foreign keys automatically.
  categoryIdIdx: index('menu_items_category_id_idx').on(table.categoryId),
}));

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),
  deliveryAddress: text('delivery_address').notNull(),
  deliveryNotes: text('delivery_notes'),
  paymentMethod: text('payment_method').notNull(), // 'COD' | 'EASYPAISA' | 'MEEZAN' | 'SADAPAY'
  paymentStatus: text('payment_status').default('Pending Verification').notNull(), // 'Pending Verification' | 'Paid' | 'Pending Payment (COD)' | 'Failed / Rejected' | 'Refunded'
  orderStatus: text('order_status').default('Pending').notNull(), // 'Pending' | 'Preparing' | 'Out for Delivery' | 'Completed' | 'Cancelled'
  subtotal: integer('subtotal').notNull(),
  deliveryFee: integer('delivery_fee').default(150).notNull(),
  total: integer('total').notNull(),
  transactionReference: text('transaction_reference'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Supports `ORDER BY created_at DESC`, used by every admin order list and
  // the dashboard stats query.
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
  // Supports the admin orders-page status filter dropdowns.
  orderStatusIdx: index('orders_order_status_idx').on(table.orderStatus),
  paymentStatusIdx: index('orders_payment_status_idx').on(table.paymentStatus),
}));

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  menuItemId: integer('menu_item_id').references(() => menuItems.id).notNull(),
  itemName: text('item_name').notNull(),
  unitPrice: integer('unit_price').notNull(),
  quantity: integer('quantity').notNull(),
  subtotal: integer('subtotal').notNull(),
  customizations: jsonb('customizations').$type<Record<string, any>>(),
}, (table) => ({
  // Every order lookup (customer tracking, admin order detail) joins items
  // back to their order via this foreign key.
  orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
}));

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').default('admin').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const storeSettings = pgTable('store_settings', {
  id: serial('id').primaryKey(),
  storeName: text('store_name').default('Pizzious').notNull(),
  logoType: text('logo_type').default('svg').notNull(), // 'svg' | 'image'
  logoUrl: text('logo_url'),
  phone: text('phone').default('0325 1020222').notNull(),
  whatsappNumber: text('whatsapp_number').default('+923251020222').notNull(),
  email: text('email').default('pizzious@gmail.com').notNull(),
  address: text('address').default('Madina Market, F-8, Kahuta, District Rawalpindi, Punjab, Pakistan').notNull(),
  deliveryFee: integer('delivery_fee').default(150).notNull(),
  freeDeliveryThreshold: integer('free_delivery_threshold').default(2500).notNull(),
  isDeliveryActive: boolean('is_delivery_active').default(true).notNull(),
  easyPaisaTitle: text('easypaisa_title').default('Pizzious Official').notNull(),
  easyPaisaNumber: text('easypaisa_number').default('03001234567').notNull(),
  meezanTitle: text('meezan_title').default('Pizzious Fast Food').notNull(),
  meezanIban: text('meezan_iban').default('PK42MEZN0001234567890123').notNull(),
  meezanAccount: text('meezan_account').default('01234567890').notNull(),
  sadaPayTitle: text('sadapay_title').default('Pizzious').notNull(),
  sadaPayNumber: text('sadapay_number').default('03001234567').notNull(),
  jazzCashTitle: text('jazzcash_title').default('Pizzious Official').notNull(),
  jazzCashNumber: text('jazzcash_number').default('03001234567').notNull(),
  payPalEmail: text('paypal_email').default('payments@pizzious.com').notNull(),
  payPalInstructions: text('paypal_instructions').default('Send PayPal transfer to payments@pizzious.com or paypal.me/pizzious and enter your Transaction ID or PayPal email at checkout.').notNull(),
  manualPaymentInstructions: text('manual_payment_instructions').default('Please transfer the exact order amount to any of our official accounts above and enter your Transaction ID or sender phone number at checkout for instant verification.').notNull(),
  announcementText: text('announcement_text').default('🔥 FREE Delivery on orders over Rs. 2,500! Use code PIZZIOUS for extra discounts.').notNull(),
  isAnnouncementActive: boolean('is_announcement_active').default(true).notNull(),
  heroTitle: text('hero_title').default('Crave the Crunch. Taste the Flame.').notNull(),
  heroSubtitle: text('hero_subtitle').default('Handcrafted gourmet pizzas, sizzling smash burgers, and irresistible combo deals delivered hot to your doorstep.').notNull(),
  heroImageUrl: text('hero_image_url'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  menuItems: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));