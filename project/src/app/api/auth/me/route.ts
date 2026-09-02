import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminApiRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Valid admin session required.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      adminId: session.adminId,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}