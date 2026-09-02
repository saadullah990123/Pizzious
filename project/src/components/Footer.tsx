import React from 'react';
import Link from 'next/link';
import { PizziousLogo } from './PizziousLogo';
import { StoreSettings } from '@/lib/types';
import { Phone, Mail, MapPin, Clock, Flame } from 'lucide-react';

interface FooterProps {
  settings?: StoreSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const currentYear = new Date().getFullYear();
  const phone = settings?.phone || '+92 349 5302487';
  const email = settings?.email || 'pizzious@gmail.com';
  const address = settings?.address || 'Madina Market, F-8, Kahuta, District Rawalpindi, Punjab, Pakistan';

  return (
    <footer id="contact" className="bg-white border-t border-neutral-200 text-neutral-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <PizziousLogo
              logoType={settings?.logoType}
              logoUrl={settings?.logoUrl}
              size="md"
            />
            <p className="text-neutral-600 text-xs leading-relaxed max-w-sm font-medium">
              Pizzious brings you authentic flame-baked artisan pizzas, golden crown crusts, double smash beef burgers, loaded animal-style fries, and unbeatable combo feast deals. Crafted fresh daily, delivered piping hot in under 30 minutes.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-flame bg-orange-50 p-2.5 rounded-xl border border-orange-200 w-fit">
              <Flame className="w-4 h-4 fill-brand-flame text-brand-flame" />
              <span>Taste the flame in every single bite!</span>
            </div>

            {/* Mobile App Download Badges */}
            <div className="pt-2">
              <p className="text-[11px] font-black uppercase text-neutral-800 tracking-wider mb-2">
                Order Faster on Pizzious Mobile App
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 transition-transform"
                >
                  <img
                    src="/images/Mobile-play-store-badge.6fd9e9fa.svg"
                    alt="Get on Google Play"
                    className="h-10 w-auto"
                  />
                </a>
                <a
                  href="https://apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 transition-transform"
                >
                  <img
                    src="/images/Mobile-app-store-badge.c83f0f3b.svg"
                    alt="Download on the App Store"
                    className="h-10 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-neutral-900 font-black text-sm uppercase tracking-wider">Fast Food Menu</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <a href="#deals" className="text-brand-flame hover:underline flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-brand-flame" />
                  <span>🔥 Mega Combo Deals</span>
                </a>
              </li>
              <li>
                <a href="#pizzas" className="text-neutral-700 hover:text-brand-flame transition-colors flex items-center gap-1.5">
                  <span>🍕 Gourmet Pizzas</span>
                </a>
              </li>
              <li>
                <a href="#burgers" className="text-neutral-700 hover:text-brand-flame transition-colors flex items-center gap-1.5">
                  <span>🍔 Sizzling Smash Burgers</span>
                </a>
              </li>
              <li>
                <a href="#sides" className="text-neutral-700 hover:text-brand-flame transition-colors flex items-center gap-1.5">
                  <span>🍝 Pastas & Loaded Fries</span>
                </a>
              </li>
              <li>
                <a href="#drinks" className="text-neutral-700 hover:text-brand-flame transition-colors flex items-center gap-1.5">
                  <span>🥤 Shakes & Beverages</span>
                </a>
              </li>
              <li>
                <Link href="/track" className="text-neutral-700 hover:text-brand-flame transition-colors flex items-center gap-1.5">
                  <span>📦 Track Live Order</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Branches & Cities */}
          <div className="space-y-3">
            <h4 className="text-neutral-900 font-black text-sm uppercase tracking-wider">Our Branches</h4>
            <ul className="space-y-1.5 text-xs text-neutral-600 font-medium">
              <li className="flex items-center gap-1.5 font-bold text-neutral-900">
                <MapPin className="w-3.5 h-3.5 text-brand-flame shrink-0" />
                <span>Lahore (Gulberg / DHA / Johar Town)</span>
              </li>
              <li className="flex items-center gap-1.5 font-bold text-neutral-900">
                <MapPin className="w-3.5 h-3.5 text-brand-flame shrink-0" />
                <span>Islamabad (F-7 / F-11 / Blue Area)</span>
              </li>
              <li className="flex items-center gap-1.5 font-bold text-neutral-900">
                <MapPin className="w-3.5 h-3.5 text-brand-flame shrink-0" />
                <span>Rawalpindi (Saddar / Bahria Town)</span>
              </li>
              <li className="flex items-center gap-1.5 font-bold text-neutral-900">
                <MapPin className="w-3.5 h-3.5 text-brand-flame shrink-0" />
                <span>Karachi (Clifton / DHA / Gulshan)</span>
              </li>
              <li className="flex items-center gap-1.5 font-bold text-neutral-900">
                <MapPin className="w-3.5 h-3.5 text-brand-flame shrink-0" />
                <span>Faisalabad (D-Ground)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact, Timings & Payments */}
          <div className="space-y-3">
            <h4 className="text-neutral-900 font-black text-sm uppercase tracking-wider">Helpline & Hours</h4>
            <div className="space-y-2 text-xs">
              <a href={`tel:${phone}`} className="flex items-center gap-2 text-neutral-900 font-bold hover:text-brand-flame">
                <Phone className="w-4 h-4 text-brand-flame" />
                <span>UAN: {phone}</span>
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2 text-neutral-600 hover:text-brand-flame">
                <Mail className="w-4 h-4 text-neutral-400" />
                <span>{email}</span>
              </a>
              <div className="flex items-start gap-2 pt-1 text-neutral-600">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-900 block">Open 7 Days a Week</span>
                  <span>12:00 PM – 03:00 AM (Late Night)</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-neutral-700 uppercase font-black mb-1.5">Payment Methods</p>
              <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                <span className="bg-neutral-100 text-neutral-800 px-2 py-1 rounded-md border border-neutral-200">
                  Cash on Delivery (COD)
                </span>
                <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md border border-emerald-200">
                  EasyPaisa
                </span>
                <span className="bg-amber-50 text-amber-800 px-2 py-1 rounded-md border border-amber-200">
                  JazzCash
                </span>
                <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded-md border border-blue-200">
                  Meezan Bank
                </span>
                <span className="bg-orange-50 text-orange-800 px-2 py-1 rounded-md border border-orange-200">
                  SadaPay
                </span>
                <span className="bg-sky-50 text-sky-800 px-2 py-1 rounded-md border border-sky-200">
                  PayPal
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p>© {currentYear} Pizzious Fast Food Network. All rights reserved.</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-neutral-500 font-semibold">
            <li><Link href="/privacy-policy" className="hover:text-brand-flame transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms-of-service" className="hover:text-brand-flame transition-colors">Terms of Service</Link></li>
            <li><Link href="/refund-policy" className="hover:text-brand-flame transition-colors">Refund &amp; Cancellation Policy</Link></li>
            <li><Link href="/support" className="hover:text-brand-flame transition-colors">Support</Link></li>
          </ul>
        </div>

      </div>
    </footer>
  );
};