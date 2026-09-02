import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdminApiRequest } from '@/lib/auth';
import { OrderStatus, PaymentStatus } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const orderId = Number(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await req.json();
    const { orderStatus, paymentStatus, deliveryNotes } = body;

    const validOrderStatuses: OrderStatus[] = ['Pending', 'Preparing', 'Out for Delivery', 'Completed', 'Cancelled'];
    const validPaymentStatuses: PaymentStatus[] = [
      'Pending Verification',
      'Paid',
      'Pending Payment (COD)',
      'Failed / Rejected',
      'Refunded',
    ];

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid order status value' }, { status: 400 });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid payment status value' }, { status: 400 });
    }

    const updated = await db.updateOrderStatus(orderId, orderStatus, paymentStatus, deliveryNotes);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updated,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
  }
}