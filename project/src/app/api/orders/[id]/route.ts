import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
    }

    const order = await db.getOrderByOrderNumber(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Public sanitized order view
    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        items: order.items,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}