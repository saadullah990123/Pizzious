import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdminApiRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const stats = await db.getStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to compute dashboard stats.' }, { status: 500 });
  }
}