import React from 'react';
import Link from 'next/link';
import { StaticPageLayout } from '@/components/StaticPageLayout';

export const metadata = {
  title: 'Privacy Policy | Pizzious',
  description: 'How Pizzious collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout title="Privacy Policy" lastUpdated="2 September 2026">
      <p>
        Pizzious (&ldquo;Pizzious&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), operating from
        Madina Market, F-8, Kahuta, District Rawalpindi, Punjab, Pakistan, respects your privacy. This policy
        explains what information we collect when you use our website to browse the menu and place orders, and
        how we use it.
      </p>

      <h2>Information We Collect</h2>
      <p>When you place an order, we collect:</p>
      <ul>
        <li>Your full name</li>
        <li>Phone number</li>
        <li>Email address (optional)</li>
        <li>Delivery address and any delivery notes</li>
        <li>Order contents and payment method selected</li>
        <li>For manual bank/wallet transfers, the transaction reference or sender details you provide</li>
      </ul>
      <p>
        We do not require you to create an account, and we do not collect payment card details directly &mdash;
        payments are made via cash on delivery or by transferring funds to our EasyPaisa, JazzCash, Meezan Bank,
        SadaPay, or PayPal accounts, which you confirm with a transaction reference.
      </p>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To prepare, deliver, and verify payment for your order</li>
        <li>To contact you about your order (by phone, WhatsApp, or email)</li>
        <li>To respond to support questions you send us</li>
      </ul>
      <p>We do not sell your personal information to third parties.</p>

      <h2>Who We Share It With</h2>
      <p>
        We may share order details with delivery staff so your food reaches you, and with the payment
        method you choose (e.g. your transfer is visible to the relevant bank/wallet provider). If you
        contact us through the WhatsApp button on this site, that conversation is handled through WhatsApp
        (owned by Meta), subject to WhatsApp&rsquo;s own privacy terms.
      </p>

      <h2>Data Retention</h2>
      <p className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs font-semibold">
        We have not yet finalized how long order and customer records are kept. This section will be updated
        once a retention period is confirmed.
      </p>

      <h2>Your Choices</h2>
      <p>
        You can order as a guest without providing an email address. To ask what information we hold about
        you, or to request it be deleted, contact us using the details below.
      </p>

      <h2>Contact Us</h2>
      <ul>
        <li>Address: Madina Market, F-8, Kahuta, District Rawalpindi, Punjab, Pakistan</li>
        <li>Phone: 0325 1020222</li>
        <li>Email: pizzious@gmail.com</li>
      </ul>

      <p className="text-xs text-neutral-500">
        See also our{' '}
        <Link href="/terms-of-service" className="text-brand-flame font-bold hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/refund-policy" className="text-brand-flame font-bold hover:underline">
          Refund &amp; Cancellation Policy
        </Link>
        .
      </p>
    </StaticPageLayout>
  );
}
