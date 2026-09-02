import React from 'react';
import Link from 'next/link';
import { PizziousLogo } from '@/components/PizziousLogo';
import { ShieldAlert, Home, LogIn } from 'lucide-react';

export const metadata = {
  title: 'Access Denied | Pizzious',
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-brand-darker flex flex-col items-center justify-center px-4 py-12 text-center space-y-8">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-flame/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-md">
        <div className="flex justify-center">
          <PizziousLogo size="lg" />
        </div>

        <div className="space-y-2">
          <ShieldAlert className="w-14 h-14 text-brand-flame mx-auto" />
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Access Denied
          </h1>
          {/* Deliberately generic — never reveals what resource was being accessed or why. */}
          <p className="text-neutral-400 text-sm leading-relaxed">
            You don&rsquo;t have permission to view this page.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/admin/login"
            className="flex items-center gap-2 bg-gradient-to-r from-brand-flame to-brand-500 hover:from-orange-600 hover:to-orange-500 text-white font-black px-6 py-3 rounded-2xl shadow-glow-flame hover:scale-[1.03] transition-all text-sm uppercase tracking-wide"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 bg-brand-card hover:bg-brand-cardHover text-neutral-300 border border-brand-border px-6 py-3 rounded-2xl text-sm font-semibold transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
