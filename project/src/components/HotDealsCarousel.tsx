'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuItem } from '@/lib/types';
import { DealCard } from '@/components/DealCard';
import { DEAL_PLACEHOLDER_IMAGES } from '@/lib/storefront-content';

interface HotDealsCarouselProps {
  deals: MenuItem[];
}

export const HotDealsCarousel: React.FC<HotDealsCarouselProps> = ({ deals }) => {
  const visibleDeals = deals.slice(0, 6);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (visibleDeals.length < 2 || isPaused) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleDeals.length);
    }, 3800);

    return () => window.clearInterval(interval);
  }, [isPaused, visibleDeals.length]);

  if (visibleDeals.length === 0) return null;

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + visibleDeals.length) % visibleDeals.length);
  };

  return (
    <section id="deals" className="mt-10 sm:mt-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-brand-flame animate-glow-pulse">
            Limited Time Bundles
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-[#111111]">🔥 Hot Deals</h2>
          <p className="mt-1 text-sm text-[#555555]">Limited-time combos you don&apos;t want to miss.</p>
        </div>

        {visibleDeals.length > 1 && (
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => move(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700 shadow-sm transition-colors hover:border-brand-flame hover:text-brand-flame"
              aria-label="Previous hot deal"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700 shadow-sm transition-colors hover:border-brand-flame hover:text-brand-flame"
              aria-label="Next hot deal"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div
        className="overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={(event) => {
          setIsPaused(true);
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const startX = touchStartX.current;
          const endX = event.changedTouches[0]?.clientX;
          if (startX !== null && endX !== undefined && Math.abs(endX - startX) > 40) {
            move(endX < startX ? 1 : -1);
          }
          touchStartX.current = null;
          setIsPaused(false);
        }}
      >
        <div
          className="hot-deals-track flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(calc(-${activeIndex} * (100% / var(--hot-deals-visible))))` }}
        >
          {visibleDeals.map((deal, index) => (
            <div key={deal.id} className="w-full shrink-0 px-0 sm:w-1/2 sm:px-2 lg:w-1/3">
              <DealCard
                deal={{
                  ...deal,
                  images: deal.images?.length
                    ? deal.images
                    : [DEAL_PLACEHOLDER_IMAGES[index % DEAL_PLACEHOLDER_IMAGES.length]],
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {visibleDeals.length > 1 && (
        <div className="mt-4 flex justify-center gap-1.5" aria-label="Hot deal slides">
          {visibleDeals.map((deal, index) => (
            <button
              key={deal.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-brand-flame' : 'w-2 bg-neutral-300'}`}
              aria-label={`Show hot deal ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
};