import { NextRequest, NextResponse } from 'next/server';

// Kept in sync with src/lib/auth.ts — duplicated here because Next.js
// middleware runs in the Edge Runtime, which cannot use Node's `crypto`
// module (no timingSafeEqual/createHmac), only the Web Crypto API.
const SESSION_COOKIE_NAME = 'pizzious_admin_session';
const DEV_SESSION_SECRET = 'pizzious_default_dev_session_secret_2026_change_in_prod';

function base64UrlToBytes(base64url: string): Uint8Array {
  const padded = base64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    base64url.length + ((4 - (base64url.length % 4)) % 4),
    '='
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function isValidSession(token: string, secret: string): Promise<boolean> {
  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return false;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(signature) as BufferSource,
      new TextEncoder().encode(payloadBase64)
    );
    if (!valid) return false;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadBase64)));
    const now = Math.floor(Date.now() / 1000);
    return typeof payload.expiresAt === 'number' && payload.expiresAt > now;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page itself must stay reachable (and redirect away if already logged in isn't required).
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const secret = process.env.ADMIN_SESSION_SECRET || (
    process.env.NODE_ENV !== 'production' ? DEV_SESSION_SECRET : undefined
  );

  const authenticated = !!token && !!secret && (await isValidSession(token, secret));

  if (!authenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    // A token was present but failed verification (expired / tampered / secret
    // rotated) — distinguish that from "never logged in" so the login page can
    // explain why the admin was bounced back, instead of it looking like a bug.
    if (token) {
      loginUrl.searchParams.set('reason', 'expired');
    }

    const response = NextResponse.redirect(loginUrl);
    // Always clear a stale/invalid cookie on the way out so it can't keep
    // bouncing the admin back here in a loop and isn't reused by mistake.
    if (token) {
      response.cookies.delete(SESSION_COOKIE_NAME);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
