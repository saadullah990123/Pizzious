import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdminApiRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const paymentMethod = searchParams.get('paymentMethod') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const search = searchParams.get('search') || undefined;

    const orders = await db.getOrders({
      status,
      paymentMethod,
      paymentStatus,
      search,
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders.' }, { status: 500 });
  }
}