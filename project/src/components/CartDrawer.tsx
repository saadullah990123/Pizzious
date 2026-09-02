'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { StoreSettings } from '@/lib/types';

interface CartDrawerProps {
  settings?: StoreSettings | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ settings }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 2500;
  const standardDeliveryFee = settings?.deliveryFee || 150;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const amountNeededForFree = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-neutral-200 flex flex-col shadow-2xl animate-slide-in-right">
          
          {/* Header */}
          <div className="p-5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-flame" />
              <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wide">
                Your Order ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-xl hover:bg-neutral-200 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="bg-amber-50/60 px-5 py-3 border-b border-amber-200/60">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-neutral-800 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-brand-flame" />
                {isFreeDelivery ? (
                  <span className="text-emerald-700 font-bold">🎉 FREE Delivery Unlocked!</span>
                ) : (
                  <span>Add {formatCurrency(amountNeededForFree)} more for FREE delivery</span>
                )}
              </span>
              <span className="text-amber-800 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isFreeDelivery ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-flame to-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-neutral-50/50">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200 text-neutral-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-900 font-bold text-base">Your cart is hungry!</p>
                  <p className="text-neutral-500 text-xs max-w-xs">
                    Explore our flame-grilled pizzas, smash burgers, and hot deals to add items.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-brand-flame hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-glow-flame transition-all"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              items.map((cartItem) => {
                const item = cartItem.menuItem;
                const effectivePrice =
                  item.salePrice && item.salePrice > 0 && item.salePrice < item.price
                    ? item.salePrice
                    : item.price;
                const itemTotal = effectivePrice * cartItem.quantity;
                const img = item.images && item.images.length > 0 ? item.images[0] : '';

                return (
                  <div
                    key={item.id}
                    className="flex gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-sm hover:border-neutral-300 transition-colors"
                  >
                    {/* Thumbnail */}
                    {img && (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                        <Image src={img} alt={item.name} fill sizes="64px" className="object-cover" />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-neutral-900 font-bold text-sm line-clamp-1">{item.name}</h4>
                          <span className="text-brand-flame font-black text-xs font-mono">
                            {formatCurrency(effectivePrice)} each
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 rounded-lg px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                            className="text-neutral-600 hover:text-neutral-900 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-neutral-900 font-bold text-xs font-mono px-1">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                            className="text-neutral-600 hover:text-neutral-900 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-neutral-900 font-black text-sm font-sans">
                          {formatCurrency(itemTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="safe-bottom p-5 border-t border-neutral-200 bg-white space-y-4">
              <div className="space-y-1.5 text-xs text-neutral-600 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-neutral-900 font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-mono">
                    {isFreeDelivery ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      formatCurrency(standardDeliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 text-base font-black text-neutral-900">
                  <span>Total</span>
                  <span className="text-brand-flame">
                    {formatCurrency(subtotal + (isFreeDelivery ? 0 : standardDeliveryFee))}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-3 rounded-2xl border border-neutral-200 text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors text-xs font-semibold"
                  title="Empty cart"
                >
                  Clear
                </button>
                <button
                  onClick={handleCheckoutClick}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-flame to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white font-black py-3.5 px-6 rounded-2xl shadow-glow-flame hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-wide"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};