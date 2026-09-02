'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  UtensilsCrossed,
  ArrowUpRight,
  AlertTriangle,
  Plus,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Wallet,
} from 'lucide-react';

function orderStatusClasses(status: string) {
  switch (status) {
    case 'Preparing':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Out for Delivery':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Real-time storefront metrics, order statuses, and verified revenue.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition-colors hover:border-brand-flame/40 hover:text-brand-flame"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/items"
            className="flex items-center gap-2 bg-gradient-to-r from-brand-flame to-brand-500 hover:from-orange-600 hover:to-orange-500 text-[#111111] px-4 py-2 rounded-xl text-xs font-bold shadow-glow-flame transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item / Deal</span>
          </Link>
        </div>
      </div>

      {/* Pending Verification Notice Banner */}
      {stats?.pendingVerification > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-2 text-amber-600 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111111]">
                {stats.pendingVerification} Order{stats.pendingVerification === 1 ? '' : 's'} Awaiting Bank / Wallet Verification
              </h2>
              <p className="text-xs text-neutral-600">
                Customer manual transfers via EasyPaisa, Meezan, or SadaPay need your approval.
              </p>
            </div>
          </div>
          <Link
            href="/admin/orders?paymentStatus=Pending%20Verification"
            className="bg-amber-500 text-brand-darker font-black text-xs px-4 py-2 rounded-xl hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            Review Orders
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Verified Sales</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-brand-yellow font-sans">
            {formatCurrency(stats?.totalRevenue || 0)}
          </p>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed & Completed Orders
          </span>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-brand-flame/10 text-brand-flame">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#111111] font-sans">
            {stats?.totalOrders || 0}
          </p>
          <span className="text-[11px] text-neutral-500 font-mono">
            Across COD & Bank Transfers
          </span>
        </div>

        {/* Pending Verification */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Verification</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-sans">
            {stats?.pendingVerification || 0}
          </p>
          <span className="text-[11px] text-neutral-500 font-mono">
            Requires Admin Check
          </span>
        </div>

        {/* Active Menu Items */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Catalog Items</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#111111] font-sans">
            {stats?.activeProducts || 0} <span className="text-xs text-neutral-500 font-normal">({stats?.activeDeals || 0} Deals)</span>
          </p>
          <span className="text-[11px] text-neutral-500 font-mono">
            Live on Storefront
          </span>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-black text-[#111111] uppercase tracking-wide">Recent Customer Orders</h2>
            <p className="text-xs text-neutral-500">Latest incoming live orders and transfer receipts.</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-bold text-brand-yellow hover:text-[#111111] transition-colors"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-[#fafafa] text-neutral-500 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Order #</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Payment Method</th>
                <th className="py-3.5 px-5">Payment Status</th>
                <th className="py-3.5 px-5">Order Status</th>
                <th className="py-3.5 px-5">Total</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-600">
              {stats?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-neutral-500">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                stats?.recentOrders?.map((order: any) => (
                  <tr key={order.id} className="transition-colors hover:bg-orange-50/30">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#111111]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-[#111111]">{order.customerName}</p>
                      <p className="text-[11px] text-neutral-500 font-mono">{order.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="bg-neutral-800 text-neutral-200 px-2 py-1 rounded-md text-[10px] font-mono font-bold border border-brand-border">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.paymentStatus === 'Pending Verification'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${orderStatusClasses(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-black text-brand-yellow font-sans">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href="/admin/orders"
                        className="text-brand-flame hover:text-[#111111] inline-flex items-center gap-1 font-bold"
                      >
                        <span>Manage</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Admin Actions Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/items"
          className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm group transition-all hover:border-brand-flame/40 hover:shadow-md"
        >
          <div className="space-y-1">
            <h3 className="text-[#111111] font-bold text-sm group-hover:text-brand-yellow transition-colors">
              Menu & Combo Deals Builder
            </h3>
            <p className="text-neutral-500 text-xs">Add new pizzas, burgers, or configure custom combo deals.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-brand-flame transition-colors shrink-0" />
        </Link>

        <Link
          href="/admin/categories"
          className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm group transition-all hover:border-brand-flame/40 hover:shadow-md"
        >
          <div className="space-y-1">
            <h3 className="text-[#111111] font-bold text-sm group-hover:text-brand-yellow transition-colors">
              Category Management
            </h3>
            <p className="text-neutral-500 text-xs">Create new menu categories dynamically with instant storefront sync.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-brand-flame transition-colors shrink-0" />
        </Link>

        <Link
          href="/admin/settings"
          className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm group transition-all hover:border-brand-flame/40 hover:shadow-md"
        >
          <div className="space-y-1">
            <h3 className="text-[#111111] font-bold text-sm group-hover:text-brand-yellow transition-colors">
              Bank & Wallet Settings
            </h3>
            <p className="text-neutral-500 text-xs">Update EasyPaisa numbers, Meezan IBAN, SadaPay accounts, and delivery fees.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-brand-flame transition-colors shrink-0" />
        </Link>
      </div>
    </div>
  );
}