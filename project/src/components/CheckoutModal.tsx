'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { PaymentMethod, StoreSettings } from '@/lib/types';
import { formatCurrency, getWhatsAppUrl, sanitizeCustomerInput } from '@/lib/utils';
import {
  X,
  CreditCard,
  Banknote,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  MessageCircle,
  Building2,
  Wallet,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface CheckoutModalProps {
  settings?: StoreSettings | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ settings }) => {
  const { items, subtotal, isCheckoutOpen, setIsCheckoutOpen, clearCart } = useCart();
  const [liveSettings, setLiveSettings] = useState<StoreSettings | null>(settings || null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  useEffect(() => {
    if (!isCheckoutOpen) return;

    let cancelled = false;
    setIsLoadingSettings(true);
    fetch('/api/settings', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to load payment settings');
        return response.json();
      })
      .then((data) => {
        if (!cancelled && data.settings) setLiveSettings(data.settings);
      })
      .catch((error) => console.error('Checkout settings error:', error))
      .finally(() => {
        if (!cancelled) setIsLoadingSettings(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isCheckoutOpen]);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [transactionReference, setTransactionReference] = useState('');

  // Processing & result states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currentSettings = liveSettings || settings;

  if (!isCheckoutOpen) return null;

  const freeDeliveryThreshold = currentSettings?.freeDeliveryThreshold || 2500;
  const standardDeliveryFee = currentSettings?.deliveryFee || 150;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : standardDeliveryFee;
  const total = subtotal + deliveryFee;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 9) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }
    if (!deliveryAddress.trim()) {
      setErrorMessage('Please enter your complete delivery address.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage("You're offline. Your details are still filled in — reconnect and press Confirm again.");
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        customerName: sanitizeCustomerInput(customerName, 100),
        customerPhone: sanitizeCustomerInput(customerPhone, 30),
        customerEmail: sanitizeCustomerInput(customerEmail, 254) || null,
        deliveryAddress: sanitizeCustomerInput(deliveryAddress, 1000),
        deliveryNotes: sanitizeCustomerInput(deliveryNotes, 500) || null,
        paymentMethod,
        transactionReference: sanitizeCustomerInput(transactionReference, 200) || null,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
          customizations: i.customizations || null,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order.');
      }

      setCompletedOrder(data.order);
      clearCart();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Something went wrong while placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCompletedOrder(null);
  };

  // WhatsApp follow-up link for completed order
  const orderWhatsAppUrl = completedOrder
    ? getWhatsAppUrl(
        currentSettings?.whatsappNumber || '',
        `Hi Pizzious! I placed order #${completedOrder.orderNumber} for ${formatCurrency(completedOrder.total)}. Name: ${completedOrder.customerName}. Payment Method: ${completedOrder.paymentMethod}. ${completedOrder.transactionReference ? `Transaction Ref: ${completedOrder.transactionReference}` : ''}`
      )
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden my-8 animate-fade-in">
        
        {/* Modal Header */}
        <div className="bg-neutral-50 p-5 sm:p-6 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 uppercase tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-brand-flame" />
              {completedOrder ? 'Order Confirmed!' : 'Checkout & Delivery'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5 font-medium">
              {completedOrder
                ? 'Your order has been received and is being prepared.'
                : 'Fast hot delivery straight to your doorstep.'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-neutral-700 p-2 rounded-xl hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {completedOrder ? (
            /* Order Success Screen */
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-black bg-orange-50 px-3.5 py-1.5 rounded-full text-brand-flame border border-orange-200">
                  ORDER #{completedOrder.orderNumber}
                </span>
                <h3 className="text-2xl font-black text-neutral-900">Thank You, {completedOrder.customerName}!</h3>
                <p className="text-neutral-600 text-sm max-w-md mx-auto font-medium">
                  Your order has been safely placed in our kitchen. Our delivery rider will arrive shortly.
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200 text-left space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment Option:</span>
                  <span className="text-neutral-900 font-bold">{completedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment Status:</span>
                  <span className="text-brand-flame font-bold">{completedOrder.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Order Status:</span>
                  <span className="text-emerald-700 font-bold">{completedOrder.orderStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Delivery Address:</span>
                  <span className="text-neutral-900 font-medium text-right max-w-xs">{completedOrder.deliveryAddress}</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between text-base font-black text-neutral-900">
                  <span>Grand Total:</span>
                  <span className="text-brand-flame font-sans">{formatCurrency(completedOrder.total)}</span>
                </div>
              </div>

              {/* WhatsApp Confirmation & Track Order CTAs */}
              <div className="space-y-3">
                <a
                  href={`/track?order=${completedOrder.orderNumber}`}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-flame to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white font-black py-3.5 px-6 rounded-2xl shadow-glow-flame hover:scale-[1.02] transition-all text-sm uppercase tracking-wider"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>Track Live Order Status</span>
                </a>

                <a
                  href={orderWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 px-6 rounded-2xl shadow-glow-whatsapp hover:scale-[1.02] transition-all text-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Send Order Details & Proof on WhatsApp</span>
                </a>

                <button
                  onClick={handleClose}
                  className="w-full bg-white hover:bg-neutral-100 text-neutral-700 font-bold py-3 px-6 rounded-2xl border border-neutral-200 transition-colors text-sm"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm font-medium">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Section 1: Customer Contact & Delivery */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider">
                  1. Contact & Delivery Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Full Name <span className="text-brand-flame">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ali Ahmed"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-900 text-sm focus:outline-none focus:border-brand-flame focus:bg-white transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Phone Number <span className="text-brand-flame">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 03xxxxxxxxx"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-900 text-sm focus:outline-none focus:border-brand-flame focus:bg-white transition-colors font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Email Address <span className="text-neutral-400 font-normal">(Optional for receipt)</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. ali@example.com"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-900 text-sm focus:outline-none focus:border-brand-flame focus:bg-white transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Complete Delivery Address <span className="text-brand-flame">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House/Apartment #, Street, Block, Area, City"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-900 text-sm focus:outline-none focus:border-brand-flame focus:bg-white transition-colors resize-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Special Instructions <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Ring bell twice, extra garlic dip"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-900 text-sm focus:outline-none focus:border-brand-flame focus:bg-white transition-colors font-medium"
                  />
                </div>
              </div>

              {/* Section 2: Payment Method */}
              <div className="space-y-4 pt-2 border-t border-neutral-200">
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider">
                  2. Select Payment Method
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* COD */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                      paymentMethod === 'COD'
                        ? 'bg-orange-50 border-brand-flame text-brand-flame shadow-sm'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <Banknote className={`w-5 h-5 ${paymentMethod === 'COD' ? 'text-brand-flame' : 'text-neutral-500'}`} />
                    <div>
                      <p className="font-black text-xs text-neutral-900">Cash on Delivery</p>
                      <p className="text-[10px] text-neutral-500">Pay at doorstep</p>
                    </div>
                  </button>

                  {/* EasyPaisa */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('EASYPAISA')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                      paymentMethod === 'EASYPAISA'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <Wallet className={`w-5 h-5 ${paymentMethod === 'EASYPAISA' ? 'text-emerald-600' : 'text-neutral-500'}`} />
                    <div>
                      <p className="font-black text-xs text-neutral-900">EasyPaisa</p>
                      <p className="text-[10px] text-neutral-500">Mobile Wallet</p>
                    </div>
                  </button>

                  {/* JazzCash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('JAZZCASH')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                      paymentMethod === 'JAZZCASH'
                        ? 'bg-amber-50 border-amber-600 text-amber-800 shadow-sm'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <Wallet className={`w-5 h-5 ${paymentMethod === 'JAZZCASH' ? 'text-amber-600' : 'text-neutral-500'}`} />
                    <div>
                      <p className="font-black text-xs text-neutral-900">JazzCash</p>
                      <p className="text-[10px] text-neutral-500">Mobile Wallet</p>
                    </div>
                  </button>

                  {/* SadaPay */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('SADAPAY')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                      paymentMethod === 'SADAPAY'
                        ? 'bg-orange-50 border-orange-600 text-orange-800 shadow-sm'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <Wallet className={`w-5 h-5 ${paymentMethod === 'SADAPAY' ? 'text-orange-600' : 'text-neutral-500'}`} />
                    <div>
                      <p className="font-black text-xs text-neutral-900">SadaPay</p>
                      <p className="text-[10px] text-neutral-500">Account Transfer</p>
                    </div>
                  </button>

                  {/* Meezan Bank */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MEEZAN')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                      paymentMethod === 'MEEZAN'
                        ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-sm'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <Building2 className={`w-5 h-5 ${paymentMethod === 'MEEZAN' ? 'text-blue-600' : 'text-neutral-500'}`} />
                    <div>
                      <p className="font-black text-xs text-neutral-900">Meezan Bank</p>
                      <p className="text-[10px] text-neutral-500">IBAN / Bank Transfer</p>
                    </div>
                  </button>

                  {/* PayPal */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PAYPAL')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                      paymentMethod === 'PAYPAL'
                        ? 'bg-sky-50 border-sky-600 text-sky-800 shadow-sm'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'PAYPAL' ? 'text-sky-600' : 'text-neutral-500'}`} />
                    <div>
                      <p className="font-black text-xs text-neutral-900">PayPal</p>
                      <p className="text-[10px] text-neutral-500">Online Transfer</p>
                    </div>
                  </button>
                </div>

                {/* Dynamic Bank Details / Manual Transfer Guide Box */}
                {paymentMethod !== 'COD' && (
                  <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl space-y-3 animate-fade-in">
                    <p className="text-xs font-black text-neutral-900">
                      Transfer instructions for {paymentMethod}:
                    </p>

                    {isLoadingSettings && (
                      <p className="text-xs text-neutral-500">Loading current payment details...</p>
                    )}

                    {paymentMethod === 'EASYPAISA' && (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-neutral-200">
                          <div>
                            <span className="text-neutral-500 block text-[11px]">Account Title:</span>
                            <span className="text-neutral-900 font-bold">{currentSettings?.easyPaisaTitle || 'Not configured'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-neutral-200">
                          <div>
                            <span className="text-neutral-500 block text-[11px]">EasyPaisa Number:</span>
                            <span className="text-brand-flame font-mono font-black text-sm">
                              {currentSettings?.easyPaisaNumber || 'Not configured'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(currentSettings?.easyPaisaNumber || '', 'ep')}
                            className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors font-bold"
                          >
                            {copiedKey === 'ep' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === 'ep' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'JAZZCASH' && (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-neutral-200">
                          <div>
                            <span className="text-neutral-500 block text-[11px]">Account Title:</span>
                            <span className="text-neutral-900 font-bold">{currentSettings?.jazzCashTitle || 'Not configured'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-neutral-200">
                          <div>
                            <span className="text-neutral-500 block text-[11px]">JazzCash Number:</span>
                            <span className="text-brand-flame font-mono font-black text-sm">
                              {currentSettings?.jazzCashNumber || 'Not configured'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(currentSettings?.jazzCashNumber || '', 'jc')}
                            className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors font-bold"
                          >
                            {copiedKey === 'jc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === 'jc' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'MEEZAN' && (
                      <div className="space-y-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                          <span className="text-neutral-500 block text-[11px]">Account Title:</span>
                          <span className="text-neutral-900 font-bold">{currentSettings?.meezanTitle || 'Not configured'}</span>
                        </div>
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-neutral-200">
                          <div>
                            <span className="text-neutral-500 block text-[11px]">Meezan IBAN:</span>
                            <span className="text-brand-flame font-mono font-bold text-xs">
                              {currentSettings?.meezanIban || 'Not configured'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(currentSettings?.meezanIban || '', 'meezan')}
                            className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors font-bold"
                          >
                            {copiedKey === 'meezan' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === 'meezan' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                          <span className="text-neutral-500 block text-[11px]">Account Number:</span>
                          <span className="text-neutral-900 font-mono font-bold text-xs">
                            {currentSettings?.meezanAccount || 'Not configured'}
                          </span>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'SADAPAY' && (
                      <div className="space-y-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                          <span className="text-neutral-500 block text-[11px]">Account Title:</span>
                          <span className="text-neutral-900 font-bold">{currentSettings?.sadaPayTitle || 'Not configured'}</span>
                        </div>
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-neutral-200">
                          <div>
                            <span className="text-neutral-500 block text-[11px]">SadaPay Number:</span>
                            <span className="text-brand-flame font-mono font-black text-sm">
                              {currentSettings?.sadaPayNumber || 'Not configured'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(currentSettings?.sadaPayNumber || '', 'sada')}
                            className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors font-bold"
                          >
                            {copiedKey === 'sada' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === 'sada' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'PAYPAL' && (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-neutral-200">
                          <div>
                            <span className="text-neutral-500 block text-[11px]">PayPal Email:</span>
                            <span className="text-brand-flame font-mono font-bold text-xs">
                              {currentSettings?.payPalEmail || 'Not configured'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(currentSettings?.payPalEmail || '', 'pp')}
                            className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors font-bold"
                          >
                            {copiedKey === 'pp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === 'pp' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          {currentSettings?.payPalInstructions || 'No payment instructions configured.'}
                        </p>
                      </div>
                    )}

                    {paymentMethod !== 'PAYPAL' && currentSettings?.manualPaymentInstructions && (
                      <p className="text-[11px] text-neutral-500">{currentSettings.manualPaymentInstructions}</p>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Transaction ID / Sender Details <span className="text-brand-flame">*</span>
                      </label>
                      <input
                        type="text"
                        value={transactionReference}
                        onChange={(e) => setTransactionReference(e.target.value)}
                        placeholder="e.g. TRX-984210, PayPal email, or mobile number"
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-neutral-900 text-xs focus:outline-none focus:border-brand-flame font-mono font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Order Cost Breakdown & Submit */}
              <div className="pt-4 border-t border-neutral-200 space-y-3">
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-neutral-600">
                    <span>Order Subtotal:</span>
                    <span className="font-mono font-bold text-neutral-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Delivery Charge:</span>
                    <span className="font-mono">
                      {isFreeDelivery ? <span className="text-emerald-600 font-bold">FREE</span> : formatCurrency(standardDeliveryFee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between text-base font-black text-neutral-900">
                    <span>Total Amount Payable:</span>
                    <span className="text-brand-flame font-sans">{formatCurrency(total)}</span>
                  </div>
                </div>

                <p className="text-center text-[10px] text-neutral-500 font-medium">
                  By placing this order you agree to our{' '}
                  <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-brand-flame font-bold hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-brand-flame font-bold hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-flame to-orange-500 hover:from-orange-600 hover:to-orange-500 disabled:opacity-50 text-white font-black py-4 px-6 rounded-2xl shadow-glow-flame hover:scale-[1.01] active:scale-[0.99] transition-all text-base uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Placing Your Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Place Order</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};