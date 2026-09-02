'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MenuItem } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Plus, Flame, Sparkles, Check } from 'lucide-react';

interface ProductCardProps {
  item: MenuItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const hasSale = item.salePrice && item.salePrice > 0 && item.salePrice < item.price;
  const effectivePrice = hasSale ? item.salePrice! : item.price;
  const discountPercent = hasSale ? Math.round(((item.price - item.salePrice!) / item.price) * 100) : 0;

  const handleAddToCart = () => {
    addItem(item, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const mainImage = item.images && item.images.length > 0
    ? item.images[0]
    : 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80';
  const fallbackImage = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="group relative bg-white hover:bg-neutral-50/50 border border-neutral-200 hover:border-brand-flame/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-card hover:shadow-card-hover">
      {/* Card Image Container */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-neutral-100">
        <Image
          src={imageSrc || mainImage}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          unoptimized
          onError={() => setImageSrc(fallbackImage)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

        {/* Badges Container */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {item.isBestseller && (
            <span className="bg-brand-flame text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Flame className="w-3 h-3 fill-white" />
              Bestseller
            </span>
          )}
          {hasSale && (
            <span className="bg-amber-500 text-neutral-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
              Save {discountPercent}%
            </span>
          )}
          {item.isFeatured && !item.isBestseller && (
            <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <h3 className="text-neutral-900 font-black text-base sm:text-lg tracking-tight group-hover:text-brand-flame transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="text-neutral-600 text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium">
            {item.description}
          </p>
        </div>

        {/* Bottom Price & Add to Cart */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            {hasSale && (
              <span className="text-[11px] text-neutral-400 line-through block leading-none font-mono">
                {formatCurrency(item.price)}
              </span>
            )}
            <span className="text-brand-flame font-black text-lg sm:text-xl tracking-tight font-sans">
              {formatCurrency(effectivePrice)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-brand-flame to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white hover:scale-105 active:scale-95 shadow-glow-flame/30'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};