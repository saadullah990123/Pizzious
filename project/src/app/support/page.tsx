import React from 'react';
import Link from 'next/link';
import { StaticPageLayout } from '@/components/StaticPageLayout';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Support & Help Center | Pizzious',
  description: 'Get help with an order, ask a question, or reach the Pizzious team.',
};

export default function SupportPage() {
  return (
    <StaticPageLayout title="Support &amp; Help Center">
      <p>
        Need help with an order, or have a question before ordering? Reach us directly &mdash; we typically
        respond fastest on WhatsApp.
      </p>

      <div className="not-prose grid gap-3 sm:grid-cols-2 mt-6">
        <a
          href="https://wa.me/923251020222"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 hover:bg-emerald-100 transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <p className="text-xs font-black uppercase text-emerald-900">WhatsApp</p>
            <p className="text-sm font-bold text-emerald-800">0325 1020222</p>
          </div>
        </a>

        <a
          href="tel:+923251020222"
          className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4 hover:bg-orange-100 transition-colors"
        >
          <Phone className="w-5 h-5 text-brand-flame shrink-0" />
          <div>
            <p className="text-xs font-black uppercase text-brand-flame">Call Us</p>
            <p className="text-sm font-bold text-neutral-900">0325 1020222</p>
          </div>
        </a>

        <a
          href="mailto:pizzious@gmail.com"
          className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 hover:bg-blue-100 transition-colors"
        >
          <Mail className="w-5 h-5 text-blue-700 shrink-0" />
          <div>
            <p className="text-xs font-black uppercase text-blue-900">Email</p>
            <p className="text-sm font-bold text-blue-800">pizzious@gmail.com</p>
          </div>
        </a>

        <div className="flex items-center gap-3 bg-neutral-100 border border-neutral-200 rounded-2xl p-4">
          <MapPin className="w-5 h-5 text-neutral-600 shrink-0" />
          <div>
            <p className="text-xs font-black uppercase text-neutral-700">Visit Us</p>
            <p className="text-sm font-bold text-neutral-900">Madina Market, F-8, Kahuta, District Rawalpindi, Punjab</p>
          </div>
        </div>
      </div>

      <h2>Common Questions</h2>
      <ul>
        <li>
          <strong>Where&rsquo;s my order?</strong> Track it live on the{' '}
          <Link href="/track" className="text-brand-flame font-bold hover:underline">
            order tracking page
          </Link>{' '}
          using the order number from your confirmation screen.
        </li>
        <li>
          <strong>I need to cancel or get a refund.</strong> See our{' '}
          <Link href="/refund-policy" className="text-brand-flame font-bold hover:underline">
            Refund &amp; Cancellation Policy
          </Link>{' '}
          and contact us with your order number.
        </li>
        <li>
          <strong>How is my information used?</strong> See our{' '}
          <Link href="/privacy-policy" className="text-brand-flame font-bold hover:underline">
            Privacy Policy
          </Link>
          .
        </li>
      </ul>
    </StaticPageLayout>
  );
}
