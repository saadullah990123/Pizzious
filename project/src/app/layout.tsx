import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { OfflineBanner } from '@/components/OfflineBanner';

// Single brand typeface for the ENTIRE app — storefront and admin dashboard alike.
// Self-hosted (files in src/fonts, licensed under the SIL Open Font License —
// see src/fonts/OFL.txt) rather than loaded from Google Fonts at build time.
// This means zero external network calls both at build time AND at runtime:
// no render-blocking request, no layout shift, and the build never depends on
// being able to reach fonts.googleapis.com. It's a single variable font file
// covering weights 200–800, so one file serves every weight the site uses
// (the bold/black uppercase headings throughout use the 800 end of that range).
const jakarta = localFont({
  src: [
    { path: '../fonts/PlusJakartaSans-Variable.ttf', style: 'normal' },
    { path: '../fonts/PlusJakartaSans-Italic-Variable.ttf', style: 'italic' },
  ],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pizzious | Crave the Crunch, Taste the Flame',
  description: 'Handcrafted gourmet pizzas, sizzling double smash burgers, pasta, fries, cold drinks, sandwiches, and irresistible combo deals delivered piping hot to your doorstep.',
  keywords: ['Pizzious', 'Fast Food', 'Pizza Delivery', 'Burgers', 'Pasta', 'Fries', 'Sandwiches', 'Cold Drinks', 'Combo Deals', 'Lahore Fast Food'],
  openGraph: {
    title: 'Pizzious | Gourmet Fast Food & Pizza Delivery',
    description: 'Fresh dough artisan pizzas, smash burgers, pasta, fries, sandwiches, and loaded combos delivered in 30 minutes.',
    type: 'website',
  },
};

// Explicit viewport control so the layout behaves correctly on every device class —
// phones, tablets, laptops, and large/TV screens. `viewportFit: 'cover'` lets the
// page draw edge-to-edge on notched/rounded-corner phones so the safe-area-inset
// CSS vars used by fixed elements (WhatsApp button, mobile nav) resolve correctly.
// initial-scale is pinned to 1 but zoom is intentionally left enabled (no
// maximumScale/userScalable lock) so people who need to pinch-zoom still can.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f3f1ee',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${jakarta.variable}`}>
      <head>
        {/* Performance: preconnect to Unsplash CDN for fast image loading */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://plus.unsplash.com" />
      </head>
      <body className="min-h-screen flex flex-col bg-brand-bg text-brand-darkText antialiased selection:bg-brand-flame selection:text-white font-sans">
        <OfflineBanner />
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}