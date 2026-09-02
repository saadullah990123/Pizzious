'use client';

import React from 'react';
import { Category } from '@/lib/types';
import { Flame, Pizza, Sandwich, UtensilsCrossed, CupSoda, Utensils } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategorySlug: string;
  onSelectCategory: (slug: string) => void;
}

// These categories still have their items shown in the menu (grouped under "All Categories"
// and included in search), but intentionally don't get their own filter pill/nav entry —
// keeps the nav short while their dishes still surface naturally in the Full Menu section.
const HIDDEN_FROM_NAV = new Set(['pastas', 'sandwiches']);

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
}) => {
  const getCategoryIcon = (iconName?: string, name?: string) => {
    const text = `${iconName || ''} ${name || ''}`.toLowerCase();
    if (text.includes('deal') || text.includes('combo') || text.includes('flame')) {
      return <Flame className="w-4 h-4 text-brand-flame" />;
    }
    if (text.includes('pizza')) {
      return <Pizza className="w-4 h-4 text-brand-yellow" />;
    }
    if (text.includes('burger') || text.includes('sandwich')) {
      return <Sandwich className="w-4 h-4 text-orange-400" />;
    }
    if (text.includes('pasta') || text.includes('side') || text.includes('fries') || text.includes('wing')) {
      return <UtensilsCrossed className="w-4 h-4 text-amber-400" />;
    }
    if (text.includes('drink') || text.includes('shake') || text.includes('beverage')) {
      return <CupSoda className="w-4 h-4 text-cyan-400" />;
    }
    return <Utensils className="w-4 h-4 text-neutral-400" />;
  };

  return (
    <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* All Categories Button */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-200 border ${
              selectedCategorySlug === 'all'
                ? 'bg-brand-flame text-white border-brand-flame shadow-glow-flame'
                : 'bg-neutral-100 hover:bg-neutral-200/70 text-neutral-700 border-neutral-200'
            }`}
          >
            <span>🍽️ All Categories</span>
          </button>

          {/* Dynamic Categories */}
          {categories.filter((cat) => !HIDDEN_FROM_NAV.has(cat.slug)).map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-brand-flame text-white border-brand-flame shadow-glow-flame'
                    : 'bg-neutral-100 hover:bg-neutral-200/70 text-neutral-700 border-neutral-200'
                }`}
              >
                {getCategoryIcon(cat.icon, cat.name)}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};