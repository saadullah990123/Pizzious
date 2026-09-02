<div align="center">

# 🍕 Pizzious — Fast Food Ordering Platform

**A full-stack fast food ordering platform built for speed — live storefront, real-time cart & checkout, and a complete admin dashboard for running the store.**

Order pizzas, burgers, deals & combos online, track your order, and pay your way — while the team behind the counter manages every item, order, and setting from one dashboard.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-black?style=for-the-badge&logo=vercel)](https://pizzious-mg22dmpie-williampowell8269-2291s-projects.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

🔗 **[pizzious-mg22dmpie-williampowell8269-2291s-projects.vercel.app](https://pizzious-mg22dmpie-williampowell8269-2291s-projects.vercel.app)**

</div>

---

## 📖 Overview

**Pizzious** is a modern, full-stack food ordering platform built with **Next.js 14 (App Router)** and **TypeScript**. It pairs a fast, fully responsive storefront — menu browsing, live cart, checkout, and order tracking — with a secure, database-backed **admin dashboard** for managing the entire menu, incoming orders, and store configuration in real time.

Built to run on any managed Postgres provider (Neon, Supabase, or your own), with a local JSON fallback for zero-config development.

---

## ✨ Features

### 🛍️ Storefront
- **Live Menu Catalog** — Browse by category (Pizzas, Burgers, Fries & Sides, Pastas, Sandwiches, Cold Drinks & Shakes) with a dedicated Deals & Combos section
- **Cart & Checkout** — Persistent cart context with real-time totals, delivery details, and multiple payment methods (Cash on Delivery, EasyPaisa, JazzCash, SadaPay, Meezan Bank, PayPal)
- **Server-Verified Pricing** — Every order's price is recalculated and validated server-side at checkout, never trusted from the client
- **WhatsApp Integration** — Floating WhatsApp button for instant customer contact
- **Offline Detection** — Graceful banner when a customer's connection drops
- **Fully Responsive** — Tuned for phones, tablets, laptops, and large/TV-class screens alike

### 🔐 Admin Dashboard
- **Secure Authentication** — HMAC-signed session cookies verified at the edge (middleware) plus bcrypt-hashed passwords, with a self-service change email/password flow
- **Dashboard Stats** — Revenue, order counts, and pending-verification totals computed with SQL aggregates — built to stay fast as order history grows
- **Order Management** — View, filter, and update orders (status, payment verification, tracking)
- **Menu Management** — Full CRUD for items and categories — pricing, sale prices, images, availability, and deal flags
- **Store Settings** — Configure store info, delivery fees, and contact details directly from the dashboard

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL ([Neon](https://neon.tech/) / [Supabase](https://supabase.com/) compatible) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Styling | Tailwind CSS |
| Auth | Custom HMAC-signed sessions + bcrypt password hashing |
| Icons | Lucide React |
| Deployment | Vercel |

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── admin/               # Admin dashboard (login, items, categories, orders, settings, account)
│   ├── api/
│   │   ├── admin/           # Admin-only API routes (auth, items, orders, stats, settings, upload)
│   │   ├── orders/          # Public order creation API (server-verified pricing)
│   │   ├── menu/            # Public menu API (categories + items)
│   │   └── settings/        # Public store settings API
│   ├── refund-policy/, terms-of-service/, privacy-policy/, support/
│   └── page.tsx              # Storefront home
├── components/                # Navbar, CartDrawer, CheckoutModal, ProductCard, DealCard, Footer, etc.
├── context/                   # Cart context (persisted via localStorage)
├── db/                        # Drizzle schema, seed data, DB client (Postgres + JSON fallback)
├── lib/                       # Auth helpers, shared utilities
└── middleware.ts              # Edge-verified admin session guard
scripts/
└── verify.mjs, verify-all.mjs  # End-to-end smoke test scripts
```

---

## 🗄️ Database Schema

Built with **Drizzle ORM** against **PostgreSQL**:

| Table | Purpose |
|---|---|
| `categories` | Menu categories (Pizzas, Burgers, Deals & Combos, etc.) |
| `menu_items` | Menu catalog — name, category, pricing, sale price, images, availability, deal flag |
| `orders` | Customer orders — delivery info, payment method/status, order status, totals |
| `order_items` | Line items per order — item, quantity, unit price, subtotal |
| `admins` | Admin accounts — hashed passwords |
| `store_settings` | Key-value store for configurable site settings |

Indexed on every foreign key, filter, and sort column used by the app (`category_id`, `order_id`, `created_at`, `order_status`, `payment_status`) to stay fast as data grows.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR-USERNAME/pizzious.git
cd pizzious
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root:
```env
DATABASE_URL=your_postgresql_connection_string
ADMIN_SESSION_SECRET=your_random_secret_key
NEXT_PUBLIC_STORE_NAME=Pizzious
NEXT_PUBLIC_WHATSAPP_NUMBER=+92XXXXXXXXXX
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```
> No `DATABASE_URL`? The app automatically falls back to a local JSON store — great for trying it out with zero setup.

### 4. Push the database schema
```bash
npm run db:push
```

### 5. Run the development server
```bash
npm run dev
```

Visit **`http://localhost:3000`** for the storefront, and **`http://localhost:3000/admin/login`** for the admin dashboard.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push the Drizzle schema to your database |
| `npm run db:studio` | Open Drizzle Studio to browse your database |

---

## 📄 License

This project is privately owned by **Pizzious**. All rights reserved © 2026.

---

<div align="center">

Made with ❤️ and 🍕 for **Pizzious**

</div>
