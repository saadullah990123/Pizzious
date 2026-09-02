'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Order, OrderStatus, PaymentStatus } from '@/lib/types';
import { formatCurrency, formatDate, getWhatsAppUrl } from '@/lib/utils';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  Phone,
  MapPin,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Loader2,
  Calendar,
  Save,
} from 'lucide-react';

function orderStatusClasses(status: OrderStatus) {
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

function paymentStatusClasses(status: PaymentStatus) {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Failed / Rejected':
    case 'Refunded':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Pending Payment (COD)':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const initialPaymentStatusFilter = searchParams.get('paymentStatus') || 'all';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(initialPaymentStatusFilter);

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [draftPaymentStatus, setDraftPaymentStatus] = useState<PaymentStatus | null>(null);
  const [draftOrderStatus, setDraftOrderStatus] = useState<OrderStatus | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentMethodFilter !== 'all') params.append('paymentMethod', paymentMethodFilter);
      if (paymentStatusFilter !== 'all') params.append('paymentStatus', paymentStatusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentMethodFilter, paymentStatusFilter]);

  const handleUpdateStatus = async (orderId: number, newOrderStatus?: string, newPaymentStatus?: string) => {
    try {
      setUpdatingId(orderId);
      setActionSuccess(null);

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newOrderStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess('Status updated successfully!');
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, ...data.order } : null));
        }
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setDraftPaymentStatus(order.paymentStatus);
    setDraftOrderStatus(order.orderStatus);
  };

  const saveOrderChanges = async () => {
    if (!selectedOrder || !draftPaymentStatus || !draftOrderStatus) return;
    await handleUpdateStatus(selectedOrder.id, draftOrderStatus, draftPaymentStatus);
  };

  const paymentStatusOptions: PaymentStatus[] = [
    'Pending Verification',
    'Paid',
    'Pending Payment (COD)',
    'Failed / Rejected',
    'Refunded',
  ];

  const orderStatusOptions: OrderStatus[] = [
    'Pending',
    'Preparing',
    'Out for Delivery',
    'Completed',
    'Cancelled',
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight">
            Order Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Track customer orders, verify EasyPaisa/Meezan/SadaPay transfers, and update preparation statuses.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition-colors hover:border-brand-flame/40 hover:text-brand-flame self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              placeholder="Search Order # or phone..."
              className="w-full rounded-xl border border-neutral-200 bg-[#fafafa] py-2 pl-9 pr-3 text-xs text-[#111111] placeholder-neutral-400 focus:border-brand-flame focus:outline-none"
            />
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-[#fafafa] px-3 py-2 text-xs text-[#111111] focus:border-brand-flame focus:outline-none"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Paid">Paid</option>
              <option value="Pending Payment (COD)">Pending Payment (COD)</option>
              <option value="Failed / Rejected">Failed / Rejected</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          {/* Order Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-brand-darker border border-brand-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-flame"
            >
              <option value="all">All Order Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full bg-brand-darker border border-brand-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-flame"
            >
              <option value="all">All Payment Methods</option>
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="EASYPAISA">EasyPaisa</option>
              <option value="JAZZCASH">JazzCash</option>
              <option value="SADAPAY">SadaPay</option>
              <option value="MEEZAN">Meezan Bank</option>
              <option value="PAYPAL">PayPal</option>
            </select>
          </div>

        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-[#fafafa] text-neutral-500 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Order # & Date</th>
                <th className="py-3.5 px-4">Customer Info</th>
                <th className="py-3.5 px-4">Payment Method & Ref</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-600">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-flame mx-auto mb-2" />
                    <span className="text-neutral-500">Loading orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-500">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-orange-50/30">
                    
                    {/* Order Number & Timestamp */}
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-[#111111] text-sm">{order.orderNumber}</p>
                      <p className="text-[10px] text-neutral-500">{formatDate(order.createdAt)}</p>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#111111]">{order.customerName}</p>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-neutral-500 hover:text-brand-yellow font-mono text-[11px]"
                      >
                        {order.customerPhone}
                      </a>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4">
                      <span className="bg-neutral-800 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-brand-border block w-fit">
                        {order.paymentMethod}
                      </span>
                      {order.transactionReference && (
                        <p className="text-[10px] text-brand-yellow font-mono mt-1 truncate max-w-[130px]" title={order.transactionReference}>
                          Ref: {order.transactionReference}
                        </p>
                      )}
                    </td>

                    {/* Payment Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={order.paymentStatus}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleUpdateStatus(order.id, undefined, e.target.value)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors focus:outline-none cursor-pointer ${paymentStatusClasses(order.paymentStatus)}`}
                      >
                        {paymentStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Order Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={order.orderStatus}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value, undefined)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-bold focus:outline-none cursor-pointer ${orderStatusClasses(order.orderStatus)}`}
                      >
                        {orderStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 font-black text-brand-yellow font-sans text-sm">
                      {formatCurrency(order.total)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openOrder(order)}
                        className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-2 text-xs font-bold text-neutral-700 shadow-sm transition-colors hover:border-brand-flame hover:text-brand-flame"
                        title="View Full Order Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal with Customer Visibility */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#f3f1ee] border border-neutral-300 rounded-3xl shadow-2xl overflow-hidden my-8 animate-fade-in">
            
            {/* Modal Header */}
            <div className="bg-brand-card p-5 sm:p-6 border-b border-brand-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold bg-neutral-800 px-2.5 py-1 rounded-lg text-brand-yellow border border-brand-border">
                    {selectedOrder.orderNumber}
                  </span>
                  <span className="text-xs text-neutral-500">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <h3 className="text-xl font-black text-[#111111] mt-1">Customer Order Breakdown</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-500 hover:text-white p-2 rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Customer Info Card */}
              <div className="bg-brand-card p-4 rounded-2xl border border-brand-border space-y-3">
                <h4 className="text-xs font-bold text-brand-yellow uppercase tracking-wider">Customer Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block">Name:</span>
                    <span className="text-[#111111] font-bold text-sm">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Phone:</span>
                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="text-brand-yellow font-mono font-bold text-sm hover:underline"
                    >
                      {selectedOrder.customerPhone}
                    </a>
                  </div>
                  {selectedOrder.customerEmail && (
                    <div>
                      <span className="text-neutral-400 block">Email:</span>
                      <span className="text-[#111111] font-medium break-words">{selectedOrder.customerEmail}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-neutral-400 block">Payment Method:</span>
                    <span className="text-[#111111] font-bold">{selectedOrder.paymentMethod}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-border/60 text-xs">
                  <span className="text-neutral-400 block">Delivery Address:</span>
                  <span className="text-[#111111] font-medium break-words">{selectedOrder.deliveryAddress}</span>
                </div>

                {selectedOrder.deliveryNotes && (
                  <div className="text-xs bg-brand-darker p-2.5 rounded-xl border border-brand-border">
                    <span className="text-brand-yellow font-bold block">Customer Note:</span>
                    <span className="text-neutral-300">{selectedOrder.deliveryNotes}</span>
                  </div>
                )}

                {selectedOrder.transactionReference && (
                  <div className="text-xs bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/50">
                    <span className="text-emerald-400 font-bold block">Transfer Proof / Transaction ID:</span>
                    <span className="text-[#111111] font-mono break-all">{selectedOrder.transactionReference}</span>
                  </div>
                )}
              </div>

              {/* Items Ordered List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-brand-yellow uppercase tracking-wider">Items Ordered</h4>
                <div className="bg-brand-card rounded-2xl border border-brand-border overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-darker text-neutral-400 uppercase font-mono border-b border-brand-border/60">
                      <tr>
                        <th className="py-2.5 px-4">Item</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-[#555555]">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 px-4 font-bold text-[#111111]">
                            <div className="flex items-center gap-3 min-w-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.itemName}
                                  className="h-12 w-12 shrink-0 rounded-lg object-cover border border-neutral-200"
                                />
                              ) : (
                                <div className="h-12 w-12 shrink-0 rounded-lg border border-dashed border-neutral-300 bg-neutral-100" aria-hidden="true" />
                              )}
                              <span className="min-w-0 break-words">{item.itemName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-neutral-400">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#111111]">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal & Delivery Total */}
                <div className="bg-brand-card p-4 rounded-2xl border border-brand-border space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-[#111111]">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Delivery Fee:</span>
                    <span className="font-mono text-[#111111]">
                      {selectedOrder.deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : formatCurrency(selectedOrder.deliveryFee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between text-base font-black text-[#111111]">
                    <span>Grand Total:</span>
                    <span className="text-brand-yellow font-sans">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Quick Selectors in Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Update Payment Status:
                  </label>
                    <select
                    value={draftPaymentStatus || selectedOrder.paymentStatus}
                    onChange={(e) => setDraftPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-brand-darker text-white border border-brand-border text-xs rounded-xl px-3 py-3 focus:outline-none focus:border-brand-flame font-bold"
                  >
                    {paymentStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Update Order Status:
                  </label>
                  <select
                    value={draftOrderStatus || selectedOrder.orderStatus}
                    onChange={(e) => setDraftOrderStatus(e.target.value as OrderStatus)}
                    className="w-full bg-brand-darker text-white border border-brand-border text-xs rounded-xl px-3 py-3 focus:outline-none focus:border-brand-flame font-bold"
                  >
                    {orderStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-[#111111]">Ready to update this order?</p>
                  <p className="mt-0.5 text-xs text-[#666666]">Save both status changes together.</p>
                </div>
                <button
                  type="button"
                  onClick={saveOrderChanges}
                  disabled={updatingId === selectedOrder.id || (draftPaymentStatus === selectedOrder.paymentStatus && draftOrderStatus === selectedOrder.orderStatus)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-flame px-5 py-3 text-xs font-black text-white shadow-[0_8px_18px_rgba(255,69,0,0.22)] transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
                >
                  {updatingId === selectedOrder.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>{updatingId === selectedOrder.id ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>

              {/* Quick WhatsApp Message to Customer */}
              <div className="pt-2">
                <a
                  href={getWhatsAppUrl(
                    selectedOrder.customerPhone,
                    `Hi ${selectedOrder.customerName}! This is Pizzious regarding your Order #${selectedOrder.orderNumber} (Total: ${formatCurrency(selectedOrder.total)}). Your order status is currently: ${selectedOrder.orderStatus}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-glow-whatsapp transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp Message to Customer</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}