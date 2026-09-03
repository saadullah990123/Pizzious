import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and, desc, ilike, inArray, sql as sqlRaw } from 'drizzle-orm';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';
import { initialCategories, initialMenuItems, initialStoreSettings } from './seed-data';
import bcrypt from 'bcryptjs';
import { Category, MenuItem, Order, OrderItem, StoreSettings } from '@/lib/types';

// Check if PostgreSQL DATABASE_URL is configured and valid
const databaseUrl = process.env.DATABASE_URL?.trim();
const hasValidPostgres = databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'));

let pgPool: Pool | null = null;
let pgDb: NodePgDatabase<typeof schema> | null = null;

if (hasValidPostgres) {
  try {
    pgPool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    });
    pgDb = drizzle(pgPool, { schema });
  } catch (err) {
    console.error('Failed to initialize PostgreSQL pool, falling back to local persistent store:', err);
  }
}

// One-time seed for a fresh Postgres database.
// Tables must already exist (run `npm run db:push` once against your
// Neon/Supabase DATABASE_URL before starting the app). On first query after
// that, if the categories table is empty, we seed it with the same starter
// menu used by the local JSON store, plus the default admin account.
// onConflictDoNothing makes this safe if two requests race on cold start.
let seedPromise: Promise<void> | null = null;

function ensureSeeded(): Promise<void> {
  if (!pgDb) return Promise.resolve();
  if (!seedPromise) seedPromise = seedPostgres();
  return seedPromise;
}

async function syncPostgresSequences(): Promise<void> {
  if (!pgDb) return;

  // Starter rows use explicit IDs, so advance serial sequences before any
  // later create operation asks PostgreSQL for the next generated ID.
  await pgDb.execute(sqlRaw`
    SELECT setval(
      pg_get_serial_sequence('menu_items', 'id'),
      COALESCE(MAX(id), 1),
      COUNT(*) > 0
    )
    FROM menu_items
  `);
  await pgDb.execute(sqlRaw`
    SELECT setval(
      pg_get_serial_sequence('categories', 'id'),
      COALESCE(MAX(id), 1),
      COUNT(*) > 0
    )
    FROM categories
  `);
}

async function seedPostgres(): Promise<void> {
  if (!pgDb) return;
  try {
    const existing = await pgDb.select({ id: schema.categories.id }).from(schema.categories).limit(1);
    if (existing.length > 0) {
      // Keep existing databases in sync when new catalog items are added to
      // the starter data. Existing rows are preserved by their unique ids.
      await pgDb.insert(schema.menuItems).values(
        initialMenuItems.map((i) => ({
          id: i.id,
          categoryId: i.categoryId,
          name: i.name,
          slug: i.slug,
          description: i.description,
          price: i.price,
          salePrice: i.salePrice ?? null,
          images: i.images,
          isDeal: i.isDeal,
          dealItems: i.dealItems ?? [],
          isActive: i.isActive,
          isFeatured: i.isFeatured,
          isBestseller: i.isBestseller,
          stock: i.stock,
        }))
      ).onConflictDoNothing();

      // Repair the original Family Feast image URL, which is no longer
      // available on Unsplash. This only changes that known broken asset.
      await pgDb.update(schema.menuItems)
        .set({ images: ['https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1603508102983-99b101395d1a?w=800&auto=format&fit=crop&q=80'] })
        .where(eq(schema.menuItems.slug, 'family-feast-bonanza'));
      await syncPostgresSequences();
      return;
    }

    await pgDb.insert(schema.categories).values(
      initialCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      }))
    ).onConflictDoNothing();

    await pgDb.insert(schema.menuItems).values(
      initialMenuItems.map((i) => ({
        id: i.id,
        categoryId: i.categoryId,
        name: i.name,
        slug: i.slug,
        description: i.description,
        price: i.price,
        salePrice: i.salePrice ?? null,
        images: i.images,
        isDeal: i.isDeal,
        dealItems: i.dealItems ?? [],
        isActive: i.isActive,
        isFeatured: i.isFeatured,
        isBestseller: i.isBestseller,
        stock: i.stock,
      }))
    ).onConflictDoNothing();

    const salt = bcrypt.genSaltSync(10);
    const defaultHash = bcrypt.hashSync('PizziousAdmin2026!', salt);
    await pgDb.insert(schema.admins).values({
      email: 'admin@pizzious.com',
      passwordHash: defaultHash,
      name: 'Pizzious Admin',
      role: 'admin',
    }).onConflictDoNothing();

    await pgDb.insert(schema.storeSettings).values(initialStoreSettings).onConflictDoNothing();

    await syncPostgresSequences();

    console.log('[db] Seeded Postgres database with starter menu, categories, settings, and admin account.');
  } catch (err) {
    console.error('[db] Postgres seeding failed (tables may not exist yet - run `npm run db:push`):', err);
  }
}

// Resilient local JSON store - used only when DATABASE_URL isn't set.
// Handy for local development without a real database, but NOT durable in
// most production hosting (ephemeral filesystem). Always set DATABASE_URL
// in production.
interface LocalDataStore {
  categories: Category[];
  menuItems: MenuItem[];
  orders: Order[];
  storeSettings: StoreSettings;
  admin: {
    id: number;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
  };
}

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'pizzious-store.json');

function getInitialStore(): LocalDataStore {
  // Pre-hashed default password for admin@pizzious.com: "PizziousAdmin2026!"
  const salt = bcrypt.genSaltSync(10);
  const defaultHash = bcrypt.hashSync('PizziousAdmin2026!', salt);

  return {
    categories: initialCategories,
    menuItems: initialMenuItems.map(item => ({
      ...item,
      categoryName: initialCategories.find(c => c.id === item.categoryId)?.name || '',
      categorySlug: initialCategories.find(c => c.id === item.categoryId)?.slug || '',
    })),
    orders: [
      {
        id: 1,
        orderNumber: 'PIZ-DEMO01',
        customerName: 'Hamza Khan',
        customerPhone: '03009876543',
        customerEmail: 'hamza@example.com',
        deliveryAddress: 'House 42, Street 7, Phase 5 DHA, Lahore',
        deliveryNotes: 'Please ring bell twice and bring change.',
        paymentMethod: 'COD',
        paymentStatus: 'Pending Payment (COD)',
        orderStatus: 'Preparing',
        subtotal: 3549,
        deliveryFee: 0,
        total: 3549,
        transactionReference: null,
        items: [
          {
            id: 1,
            orderId: 1,
            menuItemId: 1,
            itemName: 'Pizzious Mega Feast Deal',
            unitPrice: 2899,
            quantity: 1,
            subtotal: 2899,
          },
          {
            id: 2,
            orderId: 1,
            menuItemId: 12,
            itemName: 'Pizzious Loaded Cheese Fries',
            unitPrice: 550,
            quantity: 1,
            subtotal: 550,
          },
        ],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 2,
        orderNumber: 'PIZ-DEMO02',
        customerName: 'Ayesha Malik',
        customerPhone: '03215554321',
        customerEmail: 'ayesha@example.com',
        deliveryAddress: 'Apartment 3B, Gulberg Heights, Lahore',
        deliveryNotes: 'Leave with reception if not answering.',
        paymentMethod: 'EASYPAISA',
        paymentStatus: 'Pending Verification',
        orderStatus: 'Pending',
        subtotal: 1850,
        deliveryFee: 150,
        total: 2000,
        transactionReference: 'EP-TRX-982419248',
        items: [
          {
            id: 3,
            orderId: 2,
            menuItemId: 4,
            itemName: 'Pizzious Crown Crust Specialty',
            unitPrice: 1850,
            quantity: 1,
            subtotal: 1850,
          }
        ],
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
      }
    ],
    storeSettings: initialStoreSettings,
    admin: {
      id: 1,
      email: 'admin@pizzious.com',
      passwordHash: defaultHash,
      name: 'Pizzious Admin',
      role: 'admin',
    },
  };
}

function readStore(): LocalDataStore {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      const dataDir = path.dirname(DATA_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const initial = getInitialStore();
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const store = JSON.parse(content) as LocalDataStore;
    const existingIds = new Set(store.menuItems.map((item) => item.id));
    const missingItems = initialMenuItems.filter((item) => !existingIds.has(item.id));
    if (missingItems.length > 0) {
      store.menuItems.push(...missingItems);
      writeStore(store);
    }
    return store;
  } catch (err) {
    console.error('Error reading local data store, resetting:', err);
    return getInitialStore();
  }
}

function writeStore(data: LocalDataStore): void {
  try {
    const dataDir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to local data store:', err);
  }
}

function withOrderItems(order: any, items: any[]): Order {
  return { ...order, items } as Order;
}

async function withOrderItemImages<T extends { items?: Array<{ menuItemId: number }> }>(order: T): Promise<T> {
  if (!order.items?.length) return order;

  const menuItems = await db.getMenuItemsByIds(order.items.map((item) => item.menuItemId));
  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      imageUrl: menuItems.get(item.menuItemId)?.images?.[0] || null,
    })),
  };
}

async function withOrdersItemImages<T extends { items?: Array<{ menuItemId: number }> }>(orders: T[]): Promise<T[]> {
  const menuItemIds = orders.flatMap((order) => order.items?.map((item) => item.menuItemId) || []);
  if (menuItemIds.length === 0) return orders;

  const menuItems = await db.getMenuItemsByIds(menuItemIds);
  return orders.map((order) => ({
    ...order,
    items: order.items?.map((item) => ({
      ...item,
      imageUrl: menuItems.get(item.menuItemId)?.images?.[0] || null,
    })),
  }));
}

// Unified Database API. Every method below branches on whether Postgres
// (pgDb) is configured. Public method signatures and return shapes are
// identical either way, so nothing above this file needs to know or care
// which backend is active.
export const db = {
  // Categories
  async getCategories() {
    if (pgDb) {
      await ensureSeeded();
      return pgDb.select().from(schema.categories).orderBy(schema.categories.sortOrder);
    }
    const store = readStore();
    return store.categories.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async getCategoryById(id: number) {
    if (pgDb) {
      await ensureSeeded();
      const rows = await pgDb.select().from(schema.categories).where(eq(schema.categories.id, id)).limit(1);
      return rows[0] || null;
    }
    const store = readStore();
    return store.categories.find(c => c.id === id) || null;
  },

  async createCategory(data: Omit<Category, 'id'>) {
    if (pgDb) {
      await ensureSeeded();
      const [created] = await pgDb.insert(schema.categories).values({
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      }).returning();
      return created;
    }
    const store = readStore();
    const newId = store.categories.length > 0 ? Math.max(...store.categories.map(c => c.id)) + 1 : 1;
    const newCategory: Category = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    store.categories.push(newCategory);
    writeStore(store);
    return newCategory;
  },

  async updateCategory(id: number, data: Partial<Category>) {
    if (pgDb) {
      await ensureSeeded();
      const { createdAt, ...updateData } = data as any;
      const [updated] = await pgDb.update(schema.categories).set(updateData).where(eq(schema.categories.id, id)).returning();
      return updated || null;
    }
    const store = readStore();
    const index = store.categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    store.categories[index] = { ...store.categories[index], ...data };
    writeStore(store);
    return store.categories[index];
  },

  async deleteCategory(id: number) {
    if (pgDb) {
      await ensureSeeded();
      // menuItems.categoryId has onDelete: 'cascade' in the schema, so items
      // under this category are removed automatically by Postgres.
      const deleted = await pgDb.delete(schema.categories).where(eq(schema.categories.id, id)).returning();
      return deleted.length > 0;
    }
    const store = readStore();
    const index = store.categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    store.categories.splice(index, 1);
    store.menuItems = store.menuItems.filter(item => item.categoryId !== id);
    writeStore(store);
    return true;
  },

  // Menu Items & Deals
  async getMenuItems(options?: { categorySlug?: string; isDeal?: boolean; isActiveOnly?: boolean }) {
    if (pgDb) {
      await ensureSeeded();
      const conditions = [];
      if (options?.isActiveOnly) conditions.push(eq(schema.menuItems.isActive, true));
      if (options?.isDeal !== undefined) conditions.push(eq(schema.menuItems.isDeal, options.isDeal));
      if (options?.categorySlug) {
        const cat = await pgDb.select({ id: schema.categories.id }).from(schema.categories).where(eq(schema.categories.slug, options.categorySlug)).limit(1);
        if (cat.length === 0) return [];
        conditions.push(eq(schema.menuItems.categoryId, cat[0].id));
      }

      const rows = await pgDb
        .select({ item: schema.menuItems, categoryName: schema.categories.name, categorySlug: schema.categories.slug })
        .from(schema.menuItems)
        .leftJoin(schema.categories, eq(schema.menuItems.categoryId, schema.categories.id))
        .where(conditions.length ? and(...conditions) : undefined);

      return rows.map(r => ({ ...r.item, categoryName: r.categoryName || 'Uncategorized', categorySlug: r.categorySlug || '' }));
    }

    const store = readStore();
    let items = store.menuItems;

    if (options?.isActiveOnly) {
      items = items.filter(item => item.isActive);
    }
    if (options?.isDeal !== undefined) {
      items = items.filter(item => item.isDeal === options.isDeal);
    }
    if (options?.categorySlug) {
      const cat = store.categories.find(c => c.slug === options.categorySlug);
      if (cat) {
        items = items.filter(item => item.categoryId === cat.id);
      }
    }

    return items.map(item => {
      const cat = store.categories.find(c => c.id === item.categoryId);
      return {
        ...item,
        categoryName: cat?.name || 'Uncategorized',
        categorySlug: cat?.slug || '',
      };
    });
  },

  async getMenuItemById(id: number) {
    if (pgDb) {
      await ensureSeeded();
      const rows = await pgDb
        .select({ item: schema.menuItems, categoryName: schema.categories.name, categorySlug: schema.categories.slug })
        .from(schema.menuItems)
        .leftJoin(schema.categories, eq(schema.menuItems.categoryId, schema.categories.id))
        .where(eq(schema.menuItems.id, id))
        .limit(1);
      if (rows.length === 0) return null;
      return { ...rows[0].item, categoryName: rows[0].categoryName || 'Uncategorized', categorySlug: rows[0].categorySlug || '' };
    }

    const store = readStore();
    const item = store.menuItems.find(i => i.id === id);
    if (!item) return null;
    const cat = store.categories.find(c => c.id === item.categoryId);
    return {
      ...item,
      categoryName: cat?.name || 'Uncategorized',
      categorySlug: cat?.slug || '',
    };
  },

  // Batch lookup for checkout — fetches every requested item in a single
  // round trip instead of one query per cart line (was previously done in a
  // loop in the orders API route). Returns a Map keyed by item id so callers
  // can validate each requested item without re-querying.
  async getMenuItemsByIds(ids: number[]): Promise<Map<number, MenuItem>> {
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return new Map();

    if (pgDb) {
      await ensureSeeded();
      const rows = await pgDb
        .select({ item: schema.menuItems, categoryName: schema.categories.name, categorySlug: schema.categories.slug })
        .from(schema.menuItems)
        .leftJoin(schema.categories, eq(schema.menuItems.categoryId, schema.categories.id))
        .where(inArray(schema.menuItems.id, uniqueIds));

      const map = new Map<number, MenuItem>();
      for (const r of rows) {
        map.set(r.item.id, { ...r.item, categoryName: r.categoryName || 'Uncategorized', categorySlug: r.categorySlug || '' } as unknown as MenuItem);
      }
      return map;
    }

    const store = readStore();
    const map = new Map<number, MenuItem>();
    for (const id of uniqueIds) {
      const item = store.menuItems.find(i => i.id === id);
      if (!item) continue;
      const cat = store.categories.find(c => c.id === item.categoryId);
      map.set(id, { ...item, categoryName: cat?.name || 'Uncategorized', categorySlug: cat?.slug || '' });
    }
    return map;
  },

  async createMenuItem(data: Omit<MenuItem, 'id'>) {
    if (pgDb) {
      await ensureSeeded();
      const [created] = await pgDb.insert(schema.menuItems).values({
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice ?? null,
        images: data.images,
        isDeal: data.isDeal,
        dealItems: data.dealItems ?? [],
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isBestseller: data.isBestseller,
        stock: data.stock,
      }).returning();
      return created;
    }
    const store = readStore();
    const newId = store.menuItems.length > 0 ? Math.max(...store.menuItems.map(i => i.id)) + 1 : 1;
    const newItem: MenuItem = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.menuItems.push(newItem);
    writeStore(store);
    return newItem;
  },

  async updateMenuItem(id: number, data: Partial<MenuItem>) {
    if (pgDb) {
      await ensureSeeded();
      const { categoryName, categorySlug, ...updateData } = data as any;
      const [updated] = await pgDb.update(schema.menuItems).set({ ...updateData, updatedAt: new Date() }).where(eq(schema.menuItems.id, id)).returning();
      return updated || null;
    }
    const store = readStore();
    const index = store.menuItems.findIndex(i => i.id === id);
    if (index === -1) return null;
    store.menuItems[index] = {
      ...store.menuItems[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    return store.menuItems[index];
  },

  async deleteMenuItem(id: number) {
    if (pgDb) {
      await ensureSeeded();
      const deleted = await pgDb.delete(schema.menuItems).where(eq(schema.menuItems.id, id)).returning();
      return deleted.length > 0;
    }
    const store = readStore();
    const index = store.menuItems.findIndex(i => i.id === id);
    if (index === -1) return false;
    store.menuItems.splice(index, 1);
    writeStore(store);
    return true;
  },

  // Orders
  async getOrders(filter?: { status?: string; paymentMethod?: string; paymentStatus?: string; search?: string }) {
    if (pgDb) {
      await ensureSeeded();
      const conditions = [];
      if (filter?.status && filter.status !== 'all') conditions.push(eq(schema.orders.orderStatus, filter.status));
      if (filter?.paymentMethod && filter.paymentMethod !== 'all') conditions.push(eq(schema.orders.paymentMethod, filter.paymentMethod.toUpperCase()));
      if (filter?.paymentStatus && filter.paymentStatus !== 'all') conditions.push(eq(schema.orders.paymentStatus, filter.paymentStatus));
      if (filter?.search) {
        const q = `%${filter.search}%`;
        conditions.push(
          sqlRaw`(${schema.orders.orderNumber} ILIKE ${q} OR ${schema.orders.customerName} ILIKE ${q} OR ${schema.orders.customerPhone} ILIKE ${q} OR ${schema.orders.deliveryAddress} ILIKE ${q})`
        );
      }

      const rows = await pgDb.query.orders.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        with: { items: true },
        orderBy: [desc(schema.orders.createdAt)],
      });
      return withOrdersItemImages(rows);
    }

    const store = readStore();
    let orders = [...store.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filter?.status && filter.status !== 'all') {
      orders = orders.filter(o => o.orderStatus.toLowerCase() === filter.status?.toLowerCase());
    }
    if (filter?.paymentMethod && filter.paymentMethod !== 'all') {
      orders = orders.filter(o => o.paymentMethod.toUpperCase() === filter.paymentMethod?.toUpperCase());
    }
    if (filter?.paymentStatus && filter.paymentStatus !== 'all') {
      orders = orders.filter(o => o.paymentStatus.toLowerCase() === filter.paymentStatus?.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      orders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.deliveryAddress.toLowerCase().includes(q)
      );
    }
    return withOrdersItemImages(orders);
  },

  // Public order lookup - order NUMBER only (e.g. "PIZ-AB12CD"), never the raw
  // sequential database id. This is deliberate: it's called from an
  // unauthenticated tracking endpoint, and looking up by sequential id would
  // let anyone enumerate every order (1, 2, 3, ...) and read other customers'
  // names, items, and totals. Order numbers are unguessable enough to serve
  // as a lookup key for "I placed this order and have the number" tracking.
  async getOrderByOrderNumber(orderNumber: string) {
    if (pgDb) {
      await ensureSeeded();
      const row = await pgDb.query.orders.findFirst({
        where: ilike(schema.orders.orderNumber, orderNumber),
        with: { items: true },
      });
      return row ? withOrderItemImages(row) : null;
    }
    const store = readStore();
    return store.orders.find(o => o.orderNumber.toLowerCase() === orderNumber.toLowerCase()) || null;
  },

  // Admin-only lookup by internal numeric id. Only ever called from routes
  // already guarded by verifyAdminApiRequest.
  async getOrderByIdAdmin(id: number) {
    if (pgDb) {
      await ensureSeeded();
      const row = await pgDb.query.orders.findFirst({
        where: eq(schema.orders.id, id),
        with: { items: true },
      });
      return row ? withOrderItemImages(row) : null;
    }
    const store = readStore();
    const order = store.orders.find(o => o.id === id) || null;
    return order ? withOrderItemImages(order) : null;
  },

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    if (pgDb) {
      await ensureSeeded();
      return pgDb.transaction(async (tx) => {
        const [order] = await tx.insert(schema.orders).values({
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerEmail: orderData.customerEmail ?? null,
          deliveryAddress: orderData.deliveryAddress,
          deliveryNotes: orderData.deliveryNotes ?? null,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus,
          orderStatus: orderData.orderStatus,
          subtotal: orderData.subtotal,
          deliveryFee: orderData.deliveryFee,
          total: orderData.total,
          transactionReference: orderData.transactionReference ?? null,
        }).returning();

        const itemsToInsert = (orderData.items || []).map((i) => ({
          orderId: order.id,
          menuItemId: i.menuItemId,
          itemName: i.itemName,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          subtotal: i.subtotal,
          customizations: i.customizations ?? null,
        }));

        const insertedItems = itemsToInsert.length > 0
          ? await tx.insert(schema.orderItems).values(itemsToInsert).returning()
          : [];

        return withOrderItems(order, insertedItems);
      });
    }

    const store = readStore();
    const newId = store.orders.length > 0 ? Math.max(...store.orders.map(o => o.id)) + 1 : 1;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    store.orders.unshift(newOrder);
    writeStore(store);
    return newOrder;
  },

  async updateOrderStatus(id: number, orderStatus?: string, paymentStatus?: string, notes?: string) {
    if (pgDb) {
      await ensureSeeded();
      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (notes !== undefined) updateData.deliveryNotes = notes;

      const [updated] = await pgDb.update(schema.orders).set(updateData).where(eq(schema.orders.id, id)).returning();
      if (!updated) return null;

      const items = await pgDb.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id));
      return withOrderItemImages(withOrderItems(updated, items));
    }

    const store = readStore();
    const index = store.orders.findIndex(o => o.id === id);
    if (index === -1) return null;

    if (orderStatus) store.orders[index].orderStatus = orderStatus as any;
    if (paymentStatus) store.orders[index].paymentStatus = paymentStatus as any;
    if (notes !== undefined) store.orders[index].deliveryNotes = notes;
    store.orders[index].updatedAt = new Date().toISOString();

    writeStore(store);
    return withOrderItemImages(store.orders[index]);
  },

  // Store Settings
  async getSettings(): Promise<StoreSettings> {
    if (pgDb) {
      await ensureSeeded();
      const rows = await pgDb.select().from(schema.storeSettings).limit(1);
      if (rows.length > 0) return rows[0] as unknown as StoreSettings;
      const [created] = await pgDb.insert(schema.storeSettings).values(initialStoreSettings).returning();
      return created as unknown as StoreSettings;
    }
    const store = readStore();
    return store.storeSettings;
  },

  async updateSettings(data: Partial<StoreSettings>) {
    if (pgDb) {
      await ensureSeeded();
      const existing = await pgDb.select({ id: schema.storeSettings.id }).from(schema.storeSettings).limit(1);
      if (existing.length === 0) {
        const { updatedAt, ...rest } = data as any;
        const [created] = await pgDb.insert(schema.storeSettings).values({ ...initialStoreSettings, ...rest }).returning();
        return created;
      }
      const [updated] = await pgDb.update(schema.storeSettings).set({ ...data, updatedAt: new Date() }).where(eq(schema.storeSettings.id, existing[0].id)).returning();
      return updated;
    }
    const store = readStore();
    store.storeSettings = {
      ...store.storeSettings,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    return store.storeSettings;
  },

  // Admin User
  async getAdminByEmail(email: string) {
    if (pgDb) {
      await ensureSeeded();
      const rows = await pgDb.select().from(schema.admins).where(ilike(schema.admins.email, email)).limit(1);
      return rows[0] || null;
    }
    const store = readStore();
    if (store.admin && store.admin.email.toLowerCase() === email.toLowerCase()) {
      return store.admin;
    }
    return null;
  },

  async getAdminById(id: number) {
    if (pgDb) {
      await ensureSeeded();
      const rows = await pgDb.select().from(schema.admins).where(eq(schema.admins.id, id)).limit(1);
      return rows[0] || null;
    }
    const store = readStore();
    if (store.admin && store.admin.id === id) {
      return store.admin;
    }
    return null;
  },

  async updateAdminPassword(adminId: number, newPasswordHash: string) {
    if (pgDb) {
      await ensureSeeded();
      const updated = await pgDb.update(schema.admins).set({ passwordHash: newPasswordHash }).where(eq(schema.admins.id, adminId)).returning();
      return updated.length > 0;
    }
    const store = readStore();
    if (store.admin && store.admin.id === adminId) {
      store.admin.passwordHash = newPasswordHash;
      writeStore(store);
      return true;
    }
    return false;
  },

  // Returns 'ok' on success, 'taken' if another admin already uses that email,
  // or 'not_found' if the admin row doesn't exist.
  async updateAdminEmail(adminId: number, newEmail: string): Promise<'ok' | 'taken' | 'not_found'> {
    const normalized = newEmail.trim().toLowerCase();
    if (pgDb) {
      await ensureSeeded();
      const existing = await pgDb.select({ id: schema.admins.id }).from(schema.admins).where(ilike(schema.admins.email, normalized)).limit(1);
      if (existing.length > 0 && existing[0].id !== adminId) return 'taken';
      const updated = await pgDb.update(schema.admins).set({ email: normalized }).where(eq(schema.admins.id, adminId)).returning();
      return updated.length > 0 ? 'ok' : 'not_found';
    }
    const store = readStore();
    if (!store.admin || store.admin.id !== adminId) return 'not_found';
    store.admin.email = normalized;
    writeStore(store);
    return 'ok';
  },

  // Analytics & Stats
  async getStats() {
    if (pgDb) {
      await ensureSeeded();

      // Aggregates computed in SQL instead of pulling every order row into
      // Node and summing/filtering in JS — same result, but the work scales
      // with Postgres's aggregate performance instead of total lifetime
      // order count and network payload size.
      const [{ totalOrders, totalRevenue, pendingVerification }] = await pgDb
        .select({
          totalOrders: sqlRaw<number>`count(*)::int`,
          totalRevenue: sqlRaw<number>`coalesce(sum(case when ${schema.orders.paymentStatus} = 'Paid' or (${schema.orders.paymentMethod} = 'COD' and ${schema.orders.orderStatus} = 'Completed') then ${schema.orders.total} else 0 end), 0)::int`,
          pendingVerification: sqlRaw<number>`count(*) filter (where ${schema.orders.paymentStatus} = 'Pending Verification')::int`,
        })
        .from(schema.orders);

      const [{ count: activeProducts }] = await pgDb.select({ count: sqlRaw<number>`count(*)::int` }).from(schema.menuItems).where(and(eq(schema.menuItems.isActive, true), eq(schema.menuItems.isDeal, false)));
      const [{ count: activeDeals }] = await pgDb.select({ count: sqlRaw<number>`count(*)::int` }).from(schema.menuItems).where(and(eq(schema.menuItems.isActive, true), eq(schema.menuItems.isDeal, true)));

      const recentOrders = await pgDb.query.orders.findMany({
        orderBy: [desc(schema.orders.createdAt)],
        limit: 5,
      });

      return { totalRevenue, totalOrders, pendingVerification, activeProducts, activeDeals, recentOrders };
    }

    const store = readStore();
    const orders = store.orders;

    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.paymentStatus === 'Paid' || (o.paymentMethod === 'COD' && o.orderStatus === 'Completed'));
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const pendingVerification = orders.filter(o => o.paymentStatus === 'Pending Verification').length;
    const activeProducts = store.menuItems.filter(i => i.isActive).length;
    const activeDeals = store.menuItems.filter(i => i.isDeal && i.isActive).length;

    const recentOrders = orders.slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      pendingVerification,
      activeProducts,
      activeDeals,
      recentOrders,
    };
  }
};

export { schema };
export const isUsingPostgres = () => !!pgDb;
