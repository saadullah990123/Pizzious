'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Category, MenuItem, StoreSettings } from '@/lib/types';
import { CategoryNav } from '@/components/CategoryNav';
import Image from 'next/image';
import { DealCard } from '@/components/DealCard';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { useCart } from '@/context/CartContext';
import { CheckoutModal } from '@/components/CheckoutModal';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { Footer } from '@/components/Footer';
import { PizziousLogo } from '@/components/PizziousLogo';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Flame, Search, Sparkles, ChefHat, Award, Clock, ArrowRight, Phone, ShoppingBag, MapPin, Menu, X } from 'lucide-react';

// Category emoji + label map for section headings
const SECTION_META: Record<string, { emoji: string; label: string; id: string }> = {
  'gourmet-pizzas':       { emoji: '🍕', label: 'Gourmet Pizzas',      id: 'pizzas' },
  'sizzling-burgers':     { emoji: '🍔', label: 'Sizzling Burgers',    id: 'burgers' },
  'fries-and-sides':      { emoji: '🍟', label: 'Fries & Sides',       id: 'fries' },
  'cold-drinks-and-shakes':{ emoji: '🥤', label: 'Cold Drinks & Shakes',id: 'drinks' },
  'pastas':               { emoji: '🍝', label: 'Pastas',              id: 'pasta' },
  'sandwiches':           { emoji: '🥪', label: 'Sandwiches',          id: 'sandwiches' },
};

const NAV_ITEMS = [
  { href: '#deals', label: 'Hot Deals' },
  { href: '#pizzas', label: 'Pizzas' },
  { href: '#burgers', label: 'Burgers' },
  { href: '#fries', label: 'Sides' },
  { href: '#drinks', label: 'Drinks' },
  { href: '#contact', label: 'Branches' },
  { href: '/track', label: 'Track Order' },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [deals, setDeals] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { itemCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const updateFromHash = () => setActiveSection(window.location.hash.replace('#', ''));
    updateFromHash();
    window.addEventListener('hashchange', updateFromHash);

    const sections = NAV_ITEMS
      .filter(({ href }) => href.startsWith('#'))
      .map(({ href }) => document.querySelector(href))
      .filter((section): section is Element => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visibleSection) setActiveSection(visibleSection.target.id);
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0.1, 0.4, 0.7] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      window.removeEventListener('hashchange', updateFromHash);
      observer.disconnect();
    };
  }, [loading]);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const [menuRes, settingsRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/settings'),
      ]);

      if (!menuRes.ok) throw new Error('Failed to load menu');

      const menuData = await menuRes.json();
      setCategories(menuData.categories || []);
      setMenuItems(menuData.items || []);
      setDeals(menuData.deals || []);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.settings || null);
      }
    } catch (error) {
      console.error('Error loading storefront data:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => menuItems.filter((item) => {
    const matchesCategory =
      selectedCategorySlug === 'all'
        ? true
        : selectedCategorySlug === 'deals-and-combos'
        ? item.isDeal
        : item.categorySlug === selectedCategorySlug;

    const searchTerm = searchQuery.trim().toLowerCase();
    const categoryName = item.categoryName?.toLowerCase() ?? '';
    const matchesSearch =
      searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      categoryName.includes(searchTerm);

    return matchesCategory && matchesSearch;
  }), [menuItems, selectedCategorySlug, searchQuery]);

  // Group items by category slug for the "all" view
  const groupedItems = useMemo(() => {
    if (selectedCategorySlug !== 'all' || searchQuery.trim()) return null;
    const groups: Record<string, MenuItem[]> = {};
    filteredItems.forEach((item) => {
      const slug = item.categorySlug || 'other';
      if (!groups[slug]) groups[slug] = [];
      groups[slug].push(item);
    });
    return groups;
  }, [filteredItems, selectedCategorySlug, searchQuery]);

  const featureCards = [
    {
      title: 'Gourmet Pizzas',
      accent: '🍕',
      description: 'Stone-baked classics, loaded specials, and signature crusts for every craving.',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=75',
      href: '#pizzas',
    },
    {
      title: 'Smash Burgers',
      accent: '🍔',
      description: 'Juicy double smash burgers, crispy chicken burgers, and loaded cheesy stacks.',
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=75',
      href: '#burgers',
    },
    {
      title: 'Fries & Sides',
      accent: '🍟',
      description: 'Loaded fries, crispy wings, and satisfyingly cheesy sides for sharing.',
      image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=75',
      href: '#fries',
    },
    {
      title: 'Cold Drinks',
      accent: '🥤',
      description: 'Chilled soft drinks, slushes, thick shakes, and creamy lassi to cool the spice.',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=75',
      href: '#drinks',
    },
    {
      title: 'Pastas',
      accent: '🍝',
      description: 'Creamy Alfredo, fiery Arrabbiata, classic Carbonara — cooked fresh to order.',
      image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=75',
      href: '#pasta',
    },
    {
      title: 'Sandwiches',
      accent: '🥪',
      description: 'Grilled subs, crispy zinger wraps, beef steaks, and paninis made fresh.',
      image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=600&auto=format&fit=crop&q=75',
      href: '#sandwiches',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3f1ee] text-[#111111]">
      {/* ── Top Navbar ── */}
      <div className="border-b border-neutral-200 bg-[#f3f1ee] sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3 sm:py-4">
            <PizziousLogo size="sm" href="/" />

            {/* Desktop Nav — original links only, no new categories */}
            <nav className="hidden items-center gap-4 lg:gap-6 text-sm font-semibold text-[#111111] md:flex" aria-label="Primary navigation">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.href.slice(1);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setActiveSection(item.href.slice(1))}
                    className={`group relative whitespace-nowrap py-2 transition-colors duration-200 ${isActive ? 'font-black text-brand-flame' : 'hover:text-brand-flame'}`}
                    aria-current={isActive ? 'location' : undefined}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-brand-flame transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <a href="tel:+923251020222" className="hidden items-center gap-2 text-sm font-bold text-[#111111] lg:flex">
                <Phone className="h-4 w-4 text-brand-flame" />
                <span>0325 1020222</span>
              </a>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-[#111111]"
                aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
              >
                <ShoppingBag className="h-4 w-4 text-brand-flame" />
                <span className="hidden sm:inline">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-flame px-1 text-[10px] font-black text-white">
                    {itemCount}
                  </span>
                )}
              </button>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex md:hidden items-center justify-center rounded-xl border border-neutral-300 bg-white p-2 text-[#111111]"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-neutral-200 py-3 pb-4 space-y-1">
                {NAV_ITEMS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-2 py-2.5 rounded-xl text-sm font-bold text-[#111111] hover:bg-neutral-100 hover:text-brand-flame transition-colors"
                >
                  {label}
                </a>
              ))}
              <a
                href="tel:+923251020222"
                className="flex items-center gap-2 px-2 py-2.5 rounded-xl text-sm font-bold text-brand-flame"
              >
                <Phone className="h-4 w-4" />
                0325 1020222
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── Announcement Banner ── */}
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 sm:py-4">
        <div className="rounded-[18px] border border-neutral-200 bg-[#f7f5f2] px-4 py-3 text-sm font-semibold text-[#111111] shadow-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 fill-brand-flame text-brand-flame" />
            <span>FREE Delivery on orders over Rs. 2,500!</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* ── Hero Section — full-bleed background photo with dark overlay ── */}
        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden pt-4 sm:pt-6 lg:rounded-b-[32px]">
          <div className="absolute inset-0">
            <Image
              src={settings?.heroImageUrl || '/images/hero-cheese-pizza.png'}
              alt="Melting cheese pull on a fresh Pizzious pizza"
              fill
              sizes="100vw"
              className="object-cover"
              priority
              fetchPriority="high"
            />
            {/* Dark gradient overlay for text contrast — image stays visible, not a flat dark box */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-2xl space-y-6">
              <div className="space-y-1.5">
                <div className="text-[14px] font-black uppercase tracking-[0.22em] text-orange-400">Pizzious</div>
                <div className="text-[14px] font-black uppercase tracking-[0.22em] text-orange-400">Crave the Flame</div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white sm:text-sm">
                <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 backdrop-blur-sm">Hot Deals</span>
                <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 backdrop-blur-sm">Pizzas</span>
                <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 backdrop-blur-sm">Burgers</span>
                <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 backdrop-blur-sm">Pasta</span>
                <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 backdrop-blur-sm">Fries</span>
                <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 backdrop-blur-sm">Sandwiches</span>
                <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 backdrop-blur-sm">Cold Drinks</span>
              </div>

              <div className="flex items-center gap-2 font-medium text-white/90">
                <MapPin className="h-4 w-4 text-orange-400" />
                <span>Lahore's #1 Rated Pizza & Burger Spot</span>
              </div>

              <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-5xl lg:text-6xl">
                Crave the crunch,<br />taste the flame
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                Handcrafted artisan pizzas, sizzling smash burgers, creamy pastas, loaded fries, fresh sandwiches, and irresistible mega deals — all delivered piping hot to your doorstep.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#pizzas"
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-flame to-orange-600 px-6 py-3.5 text-sm font-black text-white shadow-glow-flame transition-all hover:scale-[1.02] hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] sm:text-base"
                >
                  <span>🍕 Order Pizzas</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#burgers"
                  className="flex items-center gap-2 rounded-2xl border-2 border-white/70 bg-white/10 px-5 py-3.5 text-sm font-black text-white backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-white/20 sm:text-base"
                >
                  <span>🍔 Smash Burgers</span>
                </a>
                <a
                  href="#deals"
                  className="flex items-center gap-2 rounded-2xl border border-amber-300/60 bg-amber-400/20 px-5 py-3.5 text-sm font-black text-amber-100 backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-amber-400/30 sm:text-base"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>🔥 Hot Deals</span>
                </a>
              </div>

              <div className="grid max-w-lg grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
                {[
                  { label: '30-Min', note: 'Hot Delivery' },
                  { label: '100% Halal', note: 'Fresh Ingredients' },
                  { label: '50K+ Foodies', note: '4.9/5 Rating' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-sm backdrop-blur-md">
                    <div className="text-xl font-black text-white">{item.label}</div>
                    <div className="text-xs text-white/70">{item.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Gallery / Feature Cards ── */}
        <section id="gallery" className="mt-10">
          <ScrollReveal>
            <div className="mb-6">
              <h2 className="text-3xl font-black uppercase tracking-tight text-[#111111]">
                Pizza, Burgers, Pasta, Fries, Drinks & more
              </h2>
              <p className="mt-1 text-sm text-[#555555]">Everything made fresh — for every craving, every time.</p>
            </div>
          </ScrollReveal>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((card, index) => (
              <ScrollReveal key={card.title} delay={index * 80}>
                <a
                  href={card.href}
                  className="group block overflow-hidden rounded-[26px] border border-neutral-200 bg-white shadow-sm hover:shadow-md hover:border-brand-flame/40 transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-3xl">{card.accent}</span>
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="text-xl font-black text-[#111111] group-hover:text-brand-flame transition-colors">{card.title}</div>
                    <p className="text-sm leading-relaxed text-[#444444]">{card.description}</p>
                    <span className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-[#f6f3ef] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#111111] group-hover:bg-brand-flame group-hover:text-white group-hover:border-brand-flame transition-all">
                      Order now <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Hot Deals Section ── */}
        {deals.length > 0 && (
          <section id="deals" className="mt-14">
            <ScrollReveal>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-brand-flame animate-glow-pulse">
                    <Flame className="h-3.5 w-3.5 fill-brand-flame" />
                    Limited Time Bundles
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-[#111111]">Hot Deals</h2>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal, index) => (
                <ScrollReveal key={deal.id} delay={index * 80}>
                  <DealCard deal={deal} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* ── Menu Section ── */}
        <section className="mt-14">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#111111]">Full Menu</h2>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-flame" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pizzas, burgers, fries..."
                className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-sm text-[#111111] placeholder:text-neutral-500 focus:border-brand-flame focus:outline-none"
              />
            </div>
          </div>

          {searchQuery.trim() && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-flame">
              <Sparkles className="h-3.5 w-3.5" />
              Searching: {searchQuery}
            </div>
          )}

          {/* Category Filter Tabs */}
          <CategoryNav
            categories={categories}
            selectedCategorySlug={selectedCategorySlug}
            onSelectCategory={setSelectedCategorySlug}
          />

          <div className="mt-6">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-80 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
                ))}
              </div>
            ) : loadError ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-12 text-center">
                <p className="text-lg font-black text-[#111111]">Couldn&rsquo;t load the menu</p>
                <p className="mt-2 text-sm text-[#555555]">
                  Something went wrong on our end. Please check your connection and try again.
                </p>
                <button
                  onClick={() => loadData()}
                  className="mt-4 inline-flex items-center gap-2 bg-brand-flame hover:bg-orange-600 text-white font-black px-5 py-2.5 rounded-xl text-sm uppercase tracking-wide transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center">
                <p className="text-lg font-black text-[#111111]">No items found matching your search.</p>
                <p className="mt-2 text-sm text-[#555555]">Try another search or clear the filter to see all menu items.</p>
                {(searchQuery.trim() || selectedCategorySlug !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategorySlug('all');
                    }}
                    className="mt-4 inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-black px-5 py-2.5 rounded-xl text-sm uppercase tracking-wide transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : groupedItems ? (
              /* ─── Grouped view: separated sections per category ─── */
              <div className="space-y-14">
                {Object.entries(groupedItems).map(([slug, items]) => {
                  const meta = SECTION_META[slug];
                  if (!meta || items.length === 0) return null;
                  const featuredItems = items.filter((item) => item.isFeatured || item.isBestseller).slice(0, 4);
                  return (
                    <section key={slug} id={meta.id}>
                      <div className="mb-5 flex flex-wrap items-center gap-3">
                        <span className="text-3xl">{meta.emoji}</span>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-[#111111]">{meta.label}</h3>
                        <div className="h-px flex-1 bg-neutral-200" />
                        <a href={`/menu/${slug}`} className="text-xs font-black text-brand-flame transition-colors hover:text-orange-700">
                          See All {meta.label} <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                        </a>
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                        {featuredItems.map((item, index) => (
                          <ScrollReveal key={item.id} delay={(index % 4) * 60}>
                            <ProductCard item={item} />
                          </ScrollReveal>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              /* ─── Filtered / search view: flat grid ─── */
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {filteredItems.map((item, index) => (
                  <ScrollReveal key={item.id} delay={(index % 4) * 60}>
                    <ProductCard item={item} />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Why Us Section ── */}
        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { title: 'Fresh artisan dough', icon: ChefHat, text: 'Hand-kneaded daily for a crisp, airy crust and signature crown edges.', color: 'bg-orange-50 text-brand-flame' },
            { title: 'Prime ingredients', icon: Award, text: 'Authentic cheeses, fresh meats, and house-made sauces in every bite.', color: 'bg-amber-50 text-amber-600' },
            { title: 'Fast hot delivery', icon: Clock, text: 'Hot-box delivery so every pizza and burger stays fresh and satisfying.', color: 'bg-emerald-50 text-emerald-600' },
          ].map(({ title, icon: Icon, text, color }, index) => (
            <ScrollReveal key={title} delay={index * 100}>
              <div className="rounded-[24px] border border-neutral-200 bg-white p-6 shadow-sm">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black text-[#111111]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#444444]">{text}</p>
              </div>
            </ScrollReveal>
          ))}
        </section>
      </main>

      <Footer settings={settings} />
      <CartDrawer settings={settings} />
      <CheckoutModal settings={settings} />
      <FloatingWhatsApp phoneNumber={settings?.whatsappNumber} />
    </div>
  );
}