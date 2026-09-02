'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Utensils } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { PizziousLogo } from '@/components/PizziousLogo';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { MenuItem } from '@/lib/types';

const CATEGORY_CONFIG: Record<string, { slug: string; title: string; description: string; emoji: string }> = {
  pizzas: {
    slug: 'gourmet-pizzas',
    title: 'Gourmet Pizzas',
    description: 'Hand-tossed pizzas, loaded with fresh toppings and baked hot to order.',
    emoji: '🍕',
  },
  burgers: {
    slug: 'sizzling-burgers',
    title: 'Sizzling Burgers',
    description: 'Smash burgers, crispy chicken stacks, and bold sauces in toasted buns.',
    emoji: '🍔',
  },
  drinks: {
    slug: 'cold-drinks-and-shakes',
    title: 'Cold Drinks & Shakes',
    description: 'Chilled branded sodas, thick shakes, slushes, and refreshing lassi.',
    emoji: '🥤',
  },
  'fries-and-sides': {
    slug: 'fries-and-sides',
    title: 'Fries & Sides',
    description: 'Crispy fries, loaded sides, wings, and shareable favorites.',
    emoji: '🍟',
  },
  pastas: {
    slug: 'pastas',
    title: 'Pastas',
    description: 'Creamy, spicy, and comforting pasta dishes cooked fresh to order.',
    emoji: '🍝',
  },
  sandwiches: {
    slug: 'sandwiches',
    title: 'Sandwiches',
    description: 'Fresh grilled sandwiches, subs, wraps, and paninis.',
    emoji: '🥪',
  },
};

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const category = CATEGORY_CONFIG[params.category];
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      setLoading(false);
      return;
    }

    fetch(`/api/menu?category=${category.slug}`)
      .then((response) => response.json())
      .then((data) => setItems(data.items || []))
      .catch((error) => console.error('Error loading category:', error))
      .finally(() => setLoading(false));
  }, [category]);

  if (!category) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-bg px-6 text-center">
        <Utensils className="h-10 w-10 text-brand-flame" />
        <h1 className="text-2xl font-black text-brand-darkText">Menu category not found</h1>
        <Link href="/" className="font-bold text-brand-flame hover:text-orange-700">Return to storefront</Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-darkText">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <PizziousLogo size="sm" href="/" />
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-black text-neutral-700 shadow-sm transition-colors hover:border-brand-flame hover:text-brand-flame">
            <ArrowLeft className="h-4 w-4" />
            Back to Storefront
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-brand-flame">Full Category Menu</p>
          <h1 className="text-4xl font-black tracking-tight text-brand-darkText sm:text-5xl">
            <span className="mr-2">{category.emoji}</span>{category.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-neutral-600">{category.description}</p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-flame" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
            <p className="text-lg font-black">No items are available in this category yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => <ProductCard key={item.id} item={item} />)}
          </div>
        )}
      </main>

      <FloatingWhatsApp />
    </div>
  );
}
