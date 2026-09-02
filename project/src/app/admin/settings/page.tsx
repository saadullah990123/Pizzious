'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/lib/types';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Wallet,
  CreditCard,
  Phone,
  MessageCircle,
  Truck,
  Bell,
  Sparkles,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form States
  const [storeName, setStoreName] = useState('Pizzious');
  const [logoType, setLogoType] = useState<'svg' | 'image'>('svg');
  const [logoUrl, setLogoUrl] = useState('');
  const [phone, setPhone] = useState('0325 1020222');
  const [whatsappNumber, setWhatsappNumber] = useState('+923251020222');
  const [email, setEmail] = useState('pizzious@gmail.com');
  const [address, setAddress] = useState('Madina Market, F-8, Kahuta, District Rawalpindi, Punjab, Pakistan');
  const [deliveryFee, setDeliveryFee] = useState('150');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('2500');
  const [isDeliveryActive, setIsDeliveryActive] = useState(true);

  // Bank Accounts & Wallets
  const [easyPaisaTitle, setEasyPaisaTitle] = useState('');
  const [easyPaisaNumber, setEasyPaisaNumber] = useState('');
  const [jazzCashTitle, setJazzCashTitle] = useState('');
  const [jazzCashNumber, setJazzCashNumber] = useState('');
  const [meezanTitle, setMeezanTitle] = useState('');
  const [meezanIban, setMeezanIban] = useState('');
  const [meezanAccount, setMeezanAccount] = useState('');
  const [sadaPayTitle, setSadaPayTitle] = useState('');
  const [sadaPayNumber, setSadaPayNumber] = useState('');
  const [payPalEmail, setPayPalEmail] = useState('');
  const [payPalInstructions, setPayPalInstructions] = useState('');
  const [manualPaymentInstructions, setManualPaymentInstructions] = useState('');

  // Announcement & Hero
  const [announcementText, setAnnouncementText] = useState('');
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(true);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          const s = data.settings;
          setSettings(s);
          if (s) {
            setStoreName(s.storeName || 'Pizzious');
            setLogoType(s.logoType || 'svg');
            setLogoUrl(s.logoUrl || '');
            setPhone(s.phone || '');
            setWhatsappNumber(s.whatsappNumber || '');
            setEmail(s.email || '');
            setAddress(s.address || '');
            setDeliveryFee(String(s.deliveryFee ?? 150));
            setFreeDeliveryThreshold(String(s.freeDeliveryThreshold ?? 2500));
            setIsDeliveryActive(s.isDeliveryActive !== false);
            setEasyPaisaTitle(s.easyPaisaTitle || '');
            setEasyPaisaNumber(s.easyPaisaNumber || '');
            setJazzCashTitle(s.jazzCashTitle || '');
            setJazzCashNumber(s.jazzCashNumber || '');
            setMeezanTitle(s.meezanTitle || '');
            setMeezanIban(s.meezanIban || '');
            setMeezanAccount(s.meezanAccount || '');
            setSadaPayTitle(s.sadaPayTitle || '');
            setSadaPayNumber(s.sadaPayNumber || '');
            setPayPalEmail(s.payPalEmail || '');
            setPayPalInstructions(s.payPalInstructions || '');
            setManualPaymentInstructions(s.manualPaymentInstructions || '');
            setAnnouncementText(s.announcementText || '');
            setIsAnnouncementActive(s.isAnnouncementActive !== false);
            setHeroTitle(s.heroTitle || '');
            setHeroSubtitle(s.heroSubtitle || '');
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setIsSaving(true);
      const payload = {
        storeName,
        logoType,
        logoUrl: logoUrl.trim() || null,
        phone,
        whatsappNumber,
        email,
        address,
        deliveryFee: Number(deliveryFee) || 150,
        freeDeliveryThreshold: Number(freeDeliveryThreshold) || 2500,
        isDeliveryActive,
        easyPaisaTitle,
        easyPaisaNumber,
        jazzCashTitle,
        jazzCashNumber,
        meezanTitle,
        meezanIban,
        meezanAccount,
        sadaPayTitle,
        sadaPayNumber,
        payPalEmail,
        payPalInstructions,
        manualPaymentInstructions,
        announcementText,
        isAnnouncementActive,
        heroTitle,
        heroSubtitle,
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setSuccessMessage('Store and bank settings saved successfully! Changes are live immediately.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-flame animate-spin mb-2" />
        <span className="text-neutral-500 text-xs font-mono">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight">
            Bank & Store Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Configure payment accounts (EasyPaisa, JazzCash, Meezan, SadaPay, PayPal), WhatsApp contacts, and delivery rates.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-gradient-to-r from-brand-flame to-brand-500 hover:from-orange-600 hover:to-orange-500 disabled:opacity-50 text-[#111111] font-bold px-6 py-2.5 rounded-xl text-xs shadow-glow-flame self-start sm:self-auto transition-all"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-500/15 border border-red-500/40 text-red-300 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Bank & Wallet Accounts */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
            <Wallet className="w-5 h-5 text-brand-yellow" />
            <h2 className="text-base font-black text-[#111111] uppercase tracking-wider">
              1. Customer Payment Accounts & Wallets
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* EasyPaisa Box */}
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <Wallet className="w-4 h-4" />
                <span>EasyPaisa Account</span>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Account Title</label>
                <input
                  type="text"
                  value={easyPaisaTitle}
                  onChange={(e) => setEasyPaisaTitle(e.target.value)}
                  placeholder="e.g. Pizzious Official"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3 py-2 text-[#111111] text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">EasyPaisa Mobile Number</label>
                <input
                  type="text"
                  value={easyPaisaNumber}
                  onChange={(e) => setEasyPaisaNumber(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3 py-2 text-[#111111] text-xs focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
            </div>

            {/* JazzCash Box */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                <Wallet className="w-4 h-4" />
                <span>JazzCash Account</span>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Account Title</label>
                <input
                  type="text"
                  value={jazzCashTitle}
                  onChange={(e) => setJazzCashTitle(e.target.value)}
                  placeholder="e.g. Pizzious Official Wallet"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3 py-2 text-[#111111] text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">JazzCash Mobile Number</label>
                <input
                  type="text"
                  value={jazzCashNumber}
                  onChange={(e) => setJazzCashNumber(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3 py-2 text-[#111111] text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            {/* SadaPay Box */}
            <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-500/30 space-y-3">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase">
                <Wallet className="w-4 h-4" />
                <span>SadaPay Account</span>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Account Title</label>
                <input
                  type="text"
                  value={sadaPayTitle}
                  onChange={(e) => setSadaPayTitle(e.target.value)}
                  placeholder="e.g. Pizzious"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3 py-2 text-[#111111] text-xs focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">SadaPay Number / IBAN</label>
                <input
                  type="text"
                  value={sadaPayNumber}
                  onChange={(e) => setSadaPayNumber(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3 py-2 text-[#111111] text-xs focus:outline-none focus:border-orange-400 font-mono"
                />
              </div>
            </div>

            {/* Meezan Bank Box */}
            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-500/30 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase">
                <Building2 className="w-4 h-4" />
                <span>Meezan Bank Details</span>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Account Title</label>
                <input
                  type="text"
                  value={meezanTitle}
                  onChange={(e) => setMeezanTitle(e.target.value)}
                  placeholder="e.g. Pizzious Fast Food Pvt Ltd"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3 py-2 text-[#111111] text-xs focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Meezan IBAN</label>
                <input
                  type="text"
                  value={meezanIban}
                  onChange={(e) => setMeezanIban(e.target.value)}
                  placeholder="PK42MEZN..."
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3 py-2 text-[#111111] text-xs focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Account Number</label>
                <input
                  type="text"
                  value={meezanAccount}
                  onChange={(e) => setMeezanAccount(e.target.value)}
                  placeholder="0123456789"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3 py-2 text-[#111111] text-xs focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>
            </div>

            {/* PayPal Box */}
            <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-500/30 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase">
                <CreditCard className="w-4 h-4" />
                <span>PayPal Account</span>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">PayPal Email</label>
                <input
                  type="email"
                  value={payPalEmail}
                  onChange={(e) => setPayPalEmail(e.target.value)}
                  placeholder="payments@pizzious.com"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3 py-2 text-[#111111] text-xs focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Payment Instructions / Link</label>
                <input
                  type="text"
                  value={payPalInstructions}
                  onChange={(e) => setPayPalInstructions(e.target.value)}
                  placeholder="Send transfer to payments@pizzious.com"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3 py-2 text-[#111111] text-xs focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              Customer Manual Payment Instructions (Shown during Checkout)
            </label>
            <textarea
              rows={2}
              value={manualPaymentInstructions}
              onChange={(e) => setManualPaymentInstructions(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame resize-none"
            />
          </div>
        </div>

        {/* Section 2: Contact, WhatsApp & Delivery */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
            <Truck className="w-5 h-5 text-brand-flame" />
            <h2 className="text-base font-black text-[#111111] uppercase tracking-wider">
              2. Store Contact, WhatsApp & Delivery Rates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Order Phone Line
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Floating WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+923001234567"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Standard Delivery Charge (PKR)
              </label>
              <input
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="150"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Free Delivery Threshold (PKR)
              </label>
              <input
                type="number"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                placeholder="2500"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pizzious@gmail.com"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Store Location / Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Main Boulevard, Gulberg III, Lahore"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Brand Identity & Logo Customization */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
            <ImageIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-black text-[#111111] uppercase tracking-wider">
              3. Brand Identity & Logo Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-neutral-600">
                Logo Display Mode
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="logoType"
                    value="svg"
                    checked={logoType === 'svg'}
                    onChange={() => setLogoType('svg')}
                    className="text-brand-flame"
                  />
                  <span className="text-[#111111] font-bold">Dynamic Pizzious SVG Logo (Recommended)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="logoType"
                    value="image"
                    checked={logoType === 'image'}
                    onChange={() => setLogoType('image')}
                    className="text-brand-flame"
                  />
                  <span className="text-[#111111] font-bold">Custom Image URL</span>
                </label>
              </div>
            </div>

            {logoType === 'image' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Custom Logo Image URL
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://yourdomain.com/logo.png"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Announcement Banner & Hero Copy */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-[#111111] uppercase tracking-wider">
              4. Announcement Banner & Hero Headlines
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-600">
                  Top Announcement Banner Text
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={isAnnouncementActive}
                    onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-brand-flame"
                  />
                  <span className="text-neutral-500">Show Banner</span>
                </label>
              </div>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="🔥 FREE Delivery on orders over Rs. 2,500!"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Hero Headline
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="CRAVE THE CRUNCH. TASTE THE FLAME."
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Hero Subtitle
                </label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Handcrafted gourmet pizzas, sizzling smash burgers..."
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-flame to-brand-500 hover:from-orange-600 hover:to-orange-500 disabled:opacity-50 text-[#111111] font-black px-8 py-4 rounded-2xl text-sm uppercase tracking-wide shadow-glow-flame transition-all"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{isSaving ? 'Saving...' : 'Save & Publish All Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}