import React from 'react';
import Link from 'next/link';
import { StaticPageLayout } from '@/components/StaticPageLayout';

export const metadata = {
  title: 'Terms of Service | Pizzious',
  description: 'The terms that apply when you order from Pizzious.',
};

export default function TermsOfServicePage() {
  return (
    <StaticPageLayout title="Terms of Service" lastUpdated="2 September 2026">
      <p>
        These terms apply whenever you order food through this website from Pizzious, operating from
        Madina Market, F-8, Kahuta, District Rawalpindi, Punjab, Pakistan. By placing an order, you agree
        to them.
      </p>

      <h2>Ordering</h2>
      <p>
        No account is required. You place an order by adding items to your cart and submitting your name,
        phone number, and delivery address at checkout. Please make sure these details are accurate &mdash;
        we contact you using the phone number provided to confirm and deliver your order.
      </p>

      <h2>Pricing &amp; Availability</h2>
      <p>
        Menu prices, combo deals, and item availability may change without notice. Delivery fees and any
        free-delivery threshold shown at checkout apply at the time you place your order.
      </p>

      <h2>Payment</h2>
      <p>
        We accept Cash on Delivery, and manual transfers via EasyPaisa, JazzCash, Meezan Bank, SadaPay, and
        PayPal. For transfer payments, you must enter a valid transaction reference at checkout; orders paid
        this way are marked &ldquo;Pending Verification&rdquo; until we confirm the payment was received.
      </p>

      <h2>Order Status &amp; Cancellations</h2>
      <p>
        You can check your order status anytime using your order number on our{' '}
        <Link href="/track" className="text-brand-flame font-bold hover:underline">
          order tracking page
        </Link>
        . For cancellations and refunds, see our{' '}
        <Link href="/refund-policy" className="text-brand-flame font-bold hover:underline">
          Refund &amp; Cancellation Policy
        </Link>
        .
      </p>

      <h2>Acceptable Use</h2>
      <p>
        Please don&rsquo;t submit false contact details, place fraudulent orders, or attempt to interfere
        with the operation of this website. We may decline or cancel orders we reasonably believe are
        fraudulent or abusive.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        We aim for accurate delivery-time estimates, but delivery times (e.g. figures shown in our marketing)
        are estimates, not guarantees, and can be affected by traffic, weather, or order volume. We are not
        liable for indirect or consequential losses arising from a delayed or incorrect order, beyond
        replacing the order or issuing a refund where our{' '}
        <Link href="/refund-policy" className="text-brand-flame font-bold hover:underline">
          Refund &amp; Cancellation Policy
        </Link>{' '}
        applies.
      </p>

      <h2>Governing Law</h2>
      <p>
        These terms are governed by the laws of Pakistan. Any disputes will be subject to the jurisdiction of
        the courts of Punjab, Pakistan.
      </p>

      <h2>Contact Us</h2>
      <ul>
        <li>Address: Madina Market, F-8, Kahuta, District Rawalpindi, Punjab, Pakistan</li>
        <li>Phone: 0325 1020222</li>
        <li>Email: pizzious@gmail.com</li>
      </ul>
    </StaticPageLayout>
  );
}
