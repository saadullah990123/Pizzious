import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdminApiRequest, verifyPassword, hashPassword, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const admin = await db.getAdminById(session.adminId);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin account not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, email: admin.email, name: admin.name });
}

export async function PATCH(req: NextRequest) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { currentPassword, newEmail, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json({ success: false, error: 'Enter your current password to confirm this change.' }, { status: 400 });
    }
    if (!newEmail && !newPassword) {
      return NextResponse.json({ success: false, error: 'Provide a new email and/or a new password.' }, { status: 400 });
    }

    const admin = await db.getAdminById(session.adminId);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin account not found.' }, { status: 404 });
    }

    const isMatch = await verifyPassword(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 401 });
    }

    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return NextResponse.json({ success: false, error: 'New password must be at least 8 characters.' }, { status: 400 });
      }
      const newHash = await hashPassword(newPassword);
      await db.updateAdminPassword(session.adminId, newHash);
    }

    if (newEmail) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof newEmail !== 'string' || !emailPattern.test(newEmail)) {
        return NextResponse.json({ success: false, error: 'Enter a valid email address.' }, { status: 400 });
      }
      const result = await db.updateAdminEmail(session.adminId, newEmail);
      if (result === 'taken') {
        return NextResponse.json({ success: false, error: 'That email is already in use.' }, { status: 409 });
      }
      if (result === 'not_found') {
        return NextResponse.json({ success: false, error: 'Admin account not found.' }, { status: 404 });
      }
    }

    // Email or password changed — the current session cookie was signed with the
    // old email in its payload, so clear it and require signing in again with
    // the new credentials rather than leaving a stale session active.
    const response = NextResponse.json({
      success: true,
      message: 'Credentials updated. Please sign in again with your new details.',
    });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error('Error updating admin credentials:', error);
    return NextResponse.json({ success: false, error: 'Failed to update credentials. Please try again.' }, { status: 500 });
  }
}
