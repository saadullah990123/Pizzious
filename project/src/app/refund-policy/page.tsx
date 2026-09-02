import React from 'react';
import { StaticPageLayout } from '@/components/StaticPageLayout';

export const metadata = {
  title: 'Refund & Cancellation Policy | Pizzious',
  description: 'How order cancellations and refunds work at Pizzious.',
};

export default function RefundPolicyPage() {
  return (
    <StaticPageLayout title="Refund & Cancellation Policy" lastUpdated="2 September 2026">
      <p>
        This policy explains how cancellations and refunds are handled for orders placed with Pizzious.
      </p>

      <h2>Requesting a Cancellation or Refund</h2>
      <p>
        If there&rsquo;s a problem with your order, contact us as soon as possible with your order number:
      </p>
      <ul>
        <li>Phone / WhatsApp: 0325 1020222</li>
        <li>Email: pizzious@gmail.com</li>
      </ul>
      <p>
        Every order gets a unique order number (e.g. PIZ-XXXXXXXX) which you can also use to check live status
        on our order tracking page at any time.
      </p>

      <h2>How Refunds Are Recorded</h2>
      <p>
        Our system tracks each order as Pending, Preparing, Out for Delivery, Completed, or Cancelled, and
        each payment as Pending Verification, Paid, Pending Payment (COD), Failed/Rejected, or Refunded.
        A cancelled or refunded order is updated to reflect this, and you can see the current status by
        tracking your order.
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-xs font-semibold space-y-2">
        <p>The following specifics have not been finalized yet and will be added once confirmed:</p>
        <ul className="list-disc pl-4 space-y-1 font-medium">
          <li>The exact time window in which an order can still be cancelled free of charge (e.g. before it enters &ldquo;Preparing&rdquo;)</li>
          <li>Whether refunds for transfer payments (EasyPaisa/JazzCash/Meezan/SadaPay/PayPal) are returned to the original account and how long that takes</li>
          <li>What happens if a Cash on Delivery order is cancelled after the food has already been prepared or dispatched</li>
        </ul>
      </div>

      <h2>Contact Us</h2>
      <ul>
        <li>Address: Madina Market, F-8, Kahuta, District Rawalpindi, Punjab, Pakistan</li>
        <li>Phone: 0325 1020222</li>
        <li>Email: pizzious@gmail.com</li>
      </ul>
    </StaticPageLayout>
  );
}
