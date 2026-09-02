import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyPassword, signSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/auth';

// ── In-memory brute-force protection ──────────────────────────────────────
// Keyed by client IP + attempted email. This is process-local (resets on
// restart / doesn't share state across multiple server instances), which is
// a known limitation without Redis, but it stops the common case: a script
// hammering the login form from one machine. Good enough for a single-
// instance deployment; swap for a shared store (Redis/Upstash) if this ever
// runs behind a load balancer with multiple Node processes.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const attemptLog = new Map<string, { count: number; firstAttemptAt: number }>();

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attemptLog.get(key);

  if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
    attemptLog.set(key, { count: 1, firstAttemptAt: now });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

// Periodically clear out stale entries so the map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attemptLog.entries()) {
    if (now - entry.firstAttemptAt > WINDOW_MS) attemptLog.delete(key);
  }
}, WINDOW_MS).unref?.();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const rateLimitKey = `${getClientIp(req)}:${String(email).toLowerCase()}`;
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const admin = await db.getAdminByEmail(email);
    if (!admin) {
      // Return generic error to prevent account enumeration
      return NextResponse.json(
        { success: false, error: 'Invalid email or password credentials.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password credentials.' },
        { status: 401 }
      );
    }

    // Successful login — clear any recorded attempts for this key.
    attemptLog.delete(rateLimitKey);

    // Sign session token
    const token = signSession({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    // Set secure httpOnly cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}