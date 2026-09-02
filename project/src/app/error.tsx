'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { PizziousLogo } from '@/components/PizziousLogo';
import { Flame, Home, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Real error detail is logged here (and captured server-side via Next.js' own
    // server logging for the originating request) — never shown to the user below.
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-darker flex flex-col items-center justify-center px-4 py-12 text-center space-y-8">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-flame/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-md">
        <div className="flex justify-center">
          <PizziousLogo size="lg" />
        </div>

        <div className="space-y-2">
          <Flame className="w-14 h-14 text-brand-flame mx-auto animate-pulse" />
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Our kitchen hit a snag on our end. It&rsquo;s not something you did &mdash; please try again,
            and if it keeps happening, let us know.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-flame to-brand-500 hover:from-orange-600 hover:to-orange-500 text-white font-black px-6 py-3 rounded-2xl shadow-glow-flame hover:scale-[1.03] transition-all text-sm uppercase tracking-wide"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 bg-brand-card hover:bg-brand-cardHover text-neutral-300 border border-brand-border px-6 py-3 rounded-2xl text-sm font-semibold transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        <p className="text-xs text-neutral-500">
          Still stuck?{' '}
          <a href="/support" className="text-brand-flame font-bold hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
