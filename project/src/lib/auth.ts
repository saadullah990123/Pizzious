import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'pizzious_admin_session';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getSecretKey(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      // Never silently fall back to a shared default in production — that would let
      // anyone who has read this open-source code forge valid admin session tokens.
      throw new Error(
        'ADMIN_SESSION_SECRET is not set. Set it in your production environment before starting the server.'
      );
    }
    // Local development only: a fixed fallback keeps `npm run dev` working out of the box.
    return 'pizzious_default_dev_session_secret_2026_change_in_prod';
  }

  return secret;
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

export interface SessionPayload {
  adminId: number;
  email: string;
  name: string;
  role: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Creates an HMAC-SHA256 signed session token string
 */
export function signSession(payload: Omit<SessionPayload, 'issuedAt' | 'expiresAt'>): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    ...payload,
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE_SECONDS,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies and decodes an HMAC-SHA256 session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', getSecretKey())
      .update(payloadBase64)
      .digest('base64url');

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);

    if (payload.expiresAt < now) {
      return null; // Expired session
    }

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Server-side helper to get currently authenticated admin session from request cookies or Next.js headers
 */
export function getAdminSessionFromCookies(): SessionPayload | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Server-side helper to verify request in Next.js Route Handlers (/api/admin/*)
 */
export function verifyAdminApiRequest(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    // Check Authorization header fallback (Bearer <token>)
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return verifySessionToken(authHeader.substring(7));
    }
    return null;
  }
  return verifySessionToken(token);
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };