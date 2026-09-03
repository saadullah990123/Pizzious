'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MenuItem } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Flame, Check, Plus, PackageCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DealCardProps {
  deal: MenuItem;
}

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const { addItem } = useCart();
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const hasSale = deal.salePrice && deal.salePrice > 0 && deal.salePrice < deal.price;
  const effectivePrice = hasSale ? deal.salePrice! : deal.price;
  const savings = hasSale ? deal.price - deal.salePrice! : 0;

  const handleAddToCart = () => {
    addItem(deal, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const openDetails = () => router.push(`/product/${deal.id}`);

  const mainImage = deal.images && deal.images.length > 0
    ? deal.images[0]
    : 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80';
  const fallbackImage = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80';

  return (
    <div
      className="group relative cursor-pointer bg-white border-2 border-orange-200 hover:border-brand-flame rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-card hover:shadow-card-hover"
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLElement && event.target.closest('button')) return;
        if (event.key === 'Enter' || event.key === ' ') openDetails();
      }}
      role="link"
      tabIndex={0}
      aria-label={`View details for ${deal.name}`}
    >
      
      {/* Top Banner Tag */}
      <div className="bg-gradient-to-r from-brand-flame to-amber-500 text-white text-[11px] font-black py-1.5 px-4 uppercase tracking-widest flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 fill-white animate-bounce" />
          <span>MEGA COMBO DEAL</span>
        </div>
        {savings > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full">SAVE {formatCurrency(savings)}</span>}
      </div>

      {/* Image & Overlay */}
      <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-neutral-100">
        <Image
          src={imageSrc || mainImage}
          alt={deal.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          unoptimized
          onError={() => setImageSrc(fallbackImage)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
      </div>

      {/* Content & Items Included List */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-neutral-900 font-black text-xl sm:text-2xl tracking-tight group-hover:text-brand-flame transition-colors">
            {deal.name}
          </h3>
          <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed font-medium">
            {deal.description}
          </p>

          {/* Deal Inclusions List */}
          {deal.dealItems && deal.dealItems.length > 0 && (
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase text-amber-700 tracking-wider mb-1.5 flex items-center gap-1">
                <PackageCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Included in this Deal:</span>
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {deal.dealItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-xs text-neutral-700 bg-amber-50/70 px-2.5 py-1 rounded-lg border border-amber-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-flame" />
                    <span className="font-bold text-neutral-900">{item.quantity}x</span>
                    <span className="truncate">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between gap-3">
          <div>
            {hasSale && (
              <span className="text-xs text-neutral-400 line-through block font-mono">
                {formatCurrency(deal.price)}
              </span>
            )}
            <span className="text-brand-flame font-black text-2xl tracking-tight">
              {formatCurrency(effectivePrice)}
            </span>
          </div>

          <button
            onClick={(event) => {
              event.stopPropagation();
              handleAddToCart();
            }}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all duration-200 shadow-md ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-brand-flame to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white hover:scale-105 active:scale-95 shadow-glow-flame'
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
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};