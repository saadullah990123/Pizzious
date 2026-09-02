'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PizziousLogo } from '@/components/PizziousLogo';
import { formatCurrency } from '@/lib/utils';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Receipt,
} from 'lucide-react';

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
  'Pending': {
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/40',
    label: 'Order Received',
  },
  'Preparing': {
    icon: Package,
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/40',
    label: 'Being Prepared',
  },
  'Out for Delivery': {
    icon: Truck,
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/40',
    label: 'Out for Delivery',
  },
  'Completed': {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40',
    label: 'Delivered',
  },
  'Cancelled': {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/40',
    label: 'Cancelled',
  },
};

const steps = ['Pending', 'Preparing', 'Out for Delivery', 'Completed'];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderParam = searchParams.get('order') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderParam);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOrderDetails = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${num.trim().toUpperCase()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Order not found. Please check your order number.');
      }

      setOrder(data.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Order not found. Please check your order number and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderParam) {
      setOrderNumber(initialOrderParam);
      fetchOrderDetails(initialOrderParam);
    }
  }, [initialOrderParam]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderDetails(orderNumber);
  };

  const currentStepIndex = order ? steps.indexOf(order.orderStatus) : -1;
  const statusInfo = order ? (statusConfig[order.orderStatus] || statusConfig['Pending']) : null;

  return (
    <div className="min-h-screen bg-brand-darker flex flex-col">
      {/* Simple Header */}
      <header className="bg-brand-dark border-b border-brand-border py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <PizziousLogo size="sm" />
          <Link href="/" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 space-y-8">
        {/* Page Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-brand-card border border-brand-border px-3 py-1 rounded-full text-xs text-neutral-400 font-mono">
            <Receipt className="w-3.5 h-3.5 text-brand-flame" />
            <span>Order Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Track Your Order
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm">
            Enter your order number from your confirmation screen to check live delivery status.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="e.g. PIZ-A3B14592"
              className="w-full bg-brand-card border border-brand-border rounded-2xl pl-10 pr-4 py-3 text-white text-sm font-mono placeholder-neutral-500 focus:outline-none focus:border-brand-flame transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !orderNumber.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-flame to-brand-500 hover:from-orange-600 hover:to-orange-500 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-2xl text-sm shadow-glow-flame transition-all whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{loading ? 'Searching...' : 'Track'}</span>
          </button>
        </form>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-500/15 border border-red-500/40 text-red-300 p-4 rounded-2xl flex items-center gap-2.5 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Order Details Card */}
        {order && statusInfo && (
          <div className="space-y-5 animate-fade-in">
            {/* Status Banner */}
            <div className={`${statusInfo.bg} ${statusInfo.border} border p-5 rounded-3xl flex items-center gap-4`}>
              <div className={`p-3 rounded-2xl ${statusInfo.bg} ${statusInfo.border} border`}>
                <statusInfo.icon className={`w-7 h-7 ${statusInfo.color}`} />
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-mono">Order {order.orderNumber}</p>
                <h2 className={`text-xl font-black ${statusInfo.color}`}>
                  {statusInfo.label}
                </h2>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Payment: <span className="font-bold text-white">{order.paymentStatus}</span>
                </p>
              </div>
            </div>

            {/* Progress Bar (only for non-cancelled) */}
            {order.orderStatus !== 'Cancelled' && (
              <div className="bg-brand-card border border-brand-border p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Delivery Progress</h3>
                <div className="flex items-center gap-0">
                  {steps.map((step, idx) => {
                    const isDone = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;
                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center gap-1.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              isDone
                                ? 'bg-brand-flame border-brand-flame text-white'
                                : 'bg-brand-darker border-brand-border text-neutral-500'
                            } ${isCurrent ? 'ring-2 ring-brand-flame/40 scale-110' : ''}`}
                          >
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                          </div>
                          <span className={`text-[10px] font-bold text-center w-16 leading-tight ${isDone ? 'text-brand-yellow' : 'text-neutral-500'}`}>
                            {step}
                          </span>
                        </div>
                        {idx < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 mb-5 mx-1 ${currentStepIndex > idx ? 'bg-brand-flame' : 'bg-brand-border'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-brand-card border border-brand-border p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Order Summary</h3>
              <div className="space-y-2">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-brand-border/40 last:border-0">
                    <div>
                      <span className="text-white font-semibold">{item.itemName}</span>
                      <span className="text-neutral-500 ml-2">×{item.quantity}</span>
                    </div>
                    <span className="text-neutral-300 font-mono">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-brand-border space-y-1 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Delivery:</span>
                  <span className="font-mono">
                    {order.deliveryFee === 0
                      ? <span className="text-emerald-400 font-bold">FREE</span>
                      : formatCurrency(order.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between font-black text-sm text-white pt-1 border-t border-brand-border/60">
                  <span>Total Paid:</span>
                  <span className="text-brand-yellow font-sans">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-brand-card border border-brand-border p-4 rounded-2xl text-xs text-neutral-400 text-center">
              Questions about your order? 
              <a
                href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923251020222').replace(/[^0-9]/g, '')}?text=Hi Pizzious! I want to check my order ${order.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-bold ml-1"
              >
                WhatsApp us →
              </a>
            </div>
          </div>
        )}

        {/* Demo hint */}
        {!order && !errorMessage && (
          <div className="bg-brand-card border border-brand-border p-4 rounded-2xl text-xs text-center text-neutral-400">
            Try demo order: <span className="font-mono text-brand-yellow font-bold">PIZ-DEMO01</span>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-darker flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-flame animate-spin" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}