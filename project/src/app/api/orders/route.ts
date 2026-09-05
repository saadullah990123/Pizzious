import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { generateOrderNumber, sanitizeCustomerInput } from '@/lib/utils';
import { PaymentMethod, PaymentStatus, OrderStatus, OrderItem } from '@/lib/types';

// Lightweight per-IP rate limit — stops a script from flooding the order
// queue with fake orders. Process-local (see note in the login route for the
// same caveat on multi-instance deployments).
const MAX_ORDERS_PER_WINDOW = 8;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const orderAttemptLog = new Map<string, { count: number; firstAttemptAt: number }>();

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function isOrderRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = orderAttemptLog.get(key);
  if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
    orderAttemptLog.set(key, { count: 1, firstAttemptAt: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ORDERS_PER_WINDOW;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of orderAttemptLog.entries()) {
    if (now - entry.firstAttemptAt > WINDOW_MS) orderAttemptLog.delete(key);
  }
}, WINDOW_MS).unref?.();

export async function POST(req: NextRequest) {
  try {
    if (isOrderRateLimited(getClientIp(req))) {
      return NextResponse.json(
        { success: false, error: 'Too many orders placed from this connection recently. Please try again in a few minutes, or call us directly.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryNotes,
      paymentMethod,
      transactionReference,
      items,
    } = body;

    const cleanCustomerName = sanitizeCustomerInput(customerName, 100);
    const cleanCustomerPhone = sanitizeCustomerInput(customerPhone, 30);
    const cleanCustomerEmail = sanitizeCustomerInput(customerEmail, 254);
    const cleanDeliveryAddress = sanitizeCustomerInput(deliveryAddress, 1000);
    const cleanDeliveryNotes = sanitizeCustomerInput(deliveryNotes, 500);
    const cleanTransactionReference = sanitizeCustomerInput(transactionReference, 200);

    // 1. Rigorous Server-Side Input Validation
    if (cleanCustomerName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid customer name (minimum 2 characters).' },
        { status: 400 }
      );
    }

    if (cleanCustomerPhone.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid contact phone number.' },
        { status: 400 }
      );
    }

    if (cleanDeliveryAddress.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please provide a complete delivery address.' },
        { status: 400 }
      );
    }

    const validPaymentMethods: PaymentMethod[] = ['COD', 'EASYPAISA', 'MEEZAN', 'SADAPAY', 'JAZZCASH', 'PAYPAL'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment method selected.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one menu item.' },
        { status: 400 }
      );
    }

    // 2. Zero-Trust Item Lookup & Server-Side Price Calculation
    // Validate quantities first, then fetch every referenced item in a single
    // batched query (was previously one DB round trip per cart line).
    const requestedLines: { menuItemId: number; quantity: number; customizations: any }[] = [];
    for (const itemRequest of items) {
      const menuItemId = Number(itemRequest.menuItemId);
      const quantity = Number(itemRequest.quantity);

      if (isNaN(menuItemId) || isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
        return NextResponse.json(
          { success: false, error: 'Invalid item quantity specified.' },
          { status: 400 }
        );
      }
      requestedLines.push({ menuItemId, quantity, customizations: itemRequest.customizations || null });
    }

    const itemsById = await db.getMenuItemsByIds(requestedLines.map((l) => l.menuItemId));

    let calculatedSubtotal = 0;
    const verifiedOrderItems: OrderItem[] = [];

    for (const line of requestedLines) {
      const dbItem = itemsById.get(line.menuItemId);
      if (!dbItem || !dbItem.isActive) {
        return NextResponse.json(
          { success: false, error: `Item with ID ${line.menuItemId} is not currently available.` },
          { status: 404 }
        );
      }

      // Use active sale price if available, otherwise regular price
      const effectiveUnitPrice = (dbItem.salePrice && dbItem.salePrice > 0 && dbItem.salePrice < dbItem.price)
        ? dbItem.salePrice
        : dbItem.price;

      const itemSubtotal = effectiveUnitPrice * line.quantity;
      calculatedSubtotal += itemSubtotal;

      verifiedOrderItems.push({
        menuItemId: dbItem.id,
        itemName: dbItem.name,
        unitPrice: effectiveUnitPrice,
        quantity: line.quantity,
        subtotal: itemSubtotal,
        customizations: line.customizations,
      });
    }

    // 3. Server-Side Delivery Fee & Free Delivery Threshold Calculation
    const settings = await db.getSettings();
    let calculatedDeliveryFee = settings.deliveryFee || 150;

    if (settings.freeDeliveryThreshold && calculatedSubtotal >= settings.freeDeliveryThreshold) {
      calculatedDeliveryFee = 0;
    }

    const calculatedTotal = calculatedSubtotal + calculatedDeliveryFee;

    // 4. Initial Payment Status Workflow
    let initialPaymentStatus: PaymentStatus = 'Pending Verification';
    if (paymentMethod === 'COD') {
      initialPaymentStatus = 'Pending Payment (COD)';
    }

    const initialOrderStatus: OrderStatus = 'Pending';
    const orderNumber = generateOrderNumber();

    // 5. Store in Database
    const newOrder = await db.createOrder({
      orderNumber,
      customerName: cleanCustomerName,
      customerPhone: cleanCustomerPhone,
      customerEmail: cleanCustomerEmail || null,
      deliveryAddress: cleanDeliveryAddress,
      deliveryNotes: cleanDeliveryNotes || null,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      orderStatus: initialOrderStatus,
      subtotal: calculatedSubtotal,
      deliveryFee: calculatedDeliveryFee,
      total: calculatedTotal,
      transactionReference: cleanTransactionReference || null,
      items: verifiedOrderItems,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order placed successfully!',
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while placing your order. Please try again.' },
      { status: 500 }
    );
  }
}