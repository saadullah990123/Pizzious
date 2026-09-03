'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Flame,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Utensils,
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { PizziousLogo } from '@/components/PizziousLogo';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { Footer } from '@/components/Footer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { useCart } from '@/context/CartContext';
import { MenuItem, StoreSettings } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000&auto=format&fit=crop&q=80';

function ProductDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem, setIsCartOpen, setIsCheckoutOpen } = useCart();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const [response, settingsResponse] = await Promise.all([
          fetch('/api/menu'),
          fetch('/api/settings'),
        ]);
        if (!response.ok) throw new Error('Failed to load product');
        const data = await response.json();
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setSettings(settingsData.settings || null);
        }
        const product = (data.items || []).find((menuItem: MenuItem) => menuItem.id === Number(params.id));

        if (!product) {
          setNotFound(true);
          return;
        }

        setItem(product);
        setRelatedItems(
          (data.items || [])
            .filter((menuItem: MenuItem) => menuItem.id !== product.id && menuItem.categoryId === product.categoryId)
            .slice(0, 4)
        );
      } catch (error) {
        console.error('Error loading product:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.id]);

  const addProductToCart = () => {
    if (!item) return;
    addItem(item, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const buyNow = () => {
    if (!item) return;
    addItem(item, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg">
        <Loader2 className="h-8 w-8 animate-spin text-brand-flame" />
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-bg px-6 text-center text-brand-darkText">
        <Utensils className="h-10 w-10 text-brand-flame" />
        <h1 className="text-2xl font-black">Product not found</h1>
        <Link href="/" className="font-bold text-brand-flame hover:text-orange-700">Return to storefront</Link>
      </main>
    );
  }

  const hasSale = Boolean(item.salePrice && item.salePrice > 0 && item.salePrice < item.price);
  const effectivePrice = hasSale ? item.salePrice! : item.price;
  const mainImage = imageSrc || item.images?.[0] || FALLBACK_IMAGE;
  const categoryLabel = item.categoryName?.replace(/^[^\w]+/, '') || 'Pizzious Favorites';

  return (
    <div className="min-h-screen bg-brand-bg text-brand-darkText">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <PizziousLogo size="sm" href="/" />
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-black text-neutral-700 shadow-sm transition-colors hover:border-brand-flame hover:text-brand-flame"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-brand-flame">
          <ArrowLeft className="h-4 w-4" />
          All Menu Items
        </Link>

        <section className="grid overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-card lg:grid-cols-2">
          <div className="relative min-h-[300px] bg-neutral-100 sm:min-h-[500px]">
            <Image
              src={mainImage}
              alt={item.name}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              onError={() => setImageSrc(FALLBACK_IMAGE)}
            />
            {hasSale && (
              <span className="absolute left-5 top-5 rounded-full bg-brand-flame px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md">
                Save {formatCurrency(item.price - effectivePrice)}
              </span>
            )}
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-brand-flame">
              <span>{categoryLabel}</span>
              {item.isBestseller && <span className="rounded-full bg-orange-50 px-2.5 py-1 text-brand-flame">Bestseller</span>}
              {item.isFeatured && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">Featured</span>}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-brand-darkText sm:text-5xl">{item.name}</h1>
            <p className="mt-5 text-base leading-relaxed text-neutral-600">{item.description}</p>

            {item.isDeal && item.dealItems && item.dealItems.length > 0 && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800">
                  <Flame className="h-4 w-4" /> Included in this deal
                </p>
                <ul className="space-y-1 text-sm text-neutral-700">
                  {item.dealItems.map((dealItem) => (
                    <li key={`${dealItem.name}-${dealItem.quantity}`} className="flex gap-2">
                      <span className="font-black text-brand-flame">{dealItem.quantity}x</span>
                      <span>{dealItem.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex items-end gap-3 border-t border-neutral-200 pt-6">
              <span className="text-3xl font-black text-brand-flame">{formatCurrency(effectivePrice)}</span>
              {hasSale && <span className="pb-1 text-sm font-mono text-neutral-400 line-through">{formatCurrency(item.price)}</span>}
            </div>

            <div className="mt-6 grid w-full grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <div className="flex items-center rounded-xl border border-neutral-300 bg-neutral-50">
                <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="p-3 text-neutral-700 hover:text-brand-flame" aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center text-sm font-black text-brand-darkText">{quantity}</span>
                <button type="button" onClick={() => setQuantity((current) => current + 1)} className="p-3 text-neutral-700 hover:text-brand-flame" aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={addProductToCart}
                className="inline-flex min-h-12 min-w-0 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-brand-flame to-orange-500 px-2 py-3 text-xs font-black text-white shadow-glow-flame transition-transform hover:scale-[1.02] active:scale-[0.98] sm:gap-2 sm:px-5 sm:text-sm sm:flex-none"
              >
                {isAdded ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                {isAdded ? 'Added to Cart' : 'Add to Cart'}
              </button>
              <button
                type="button"
                onClick={buyNow}
                className="inline-flex min-h-12 min-w-0 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-brand-flame to-orange-500 px-2 py-3 text-xs font-black text-white shadow-glow-flame transition-transform hover:scale-[1.02] active:scale-[0.98] sm:gap-2 sm:px-5 sm:text-sm sm:flex-none"
              >
                <ShoppingBag className="h-5 w-5" />
                Buy Now
              </button>
            </div>
          </div>
        </section>

        {relatedItems.length > 0 && (
          <section className="mt-14">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-brand-flame">More from {categoryLabel}</p>
                <h2 className="text-3xl font-black tracking-tight text-brand-darkText">You May Also Like</h2>
              </div>
              <Link href="/" className="hidden items-center gap-1 text-xs font-black text-brand-flame hover:text-orange-700 sm:flex">
                View full menu <ChevronDown className="h-4 w-4 -rotate-90" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedItems.map((relatedItem) => <ProductCard key={relatedItem.id} item={relatedItem} />)}
            </div>
          </section>
        )}
      </main>

      <Footer settings={settings} />
      <CheckoutModal settings={settings} />
      <FloatingWhatsApp />
    </div>
  );
}

export default function ProductDetailPage() {
  return <ProductDetailContent />;
}
