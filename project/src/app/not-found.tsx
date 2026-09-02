import React from 'react';
import Link from 'next/link';
import { PizziousLogo } from '@/components/PizziousLogo';
import { Flame, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-darker flex flex-col items-center justify-center px-4 py-12 text-center space-y-8">
      {/* Glowing Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-flame/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-md">
        <div className="flex justify-center">
          <PizziousLogo size="lg" />
        </div>

        {/* 404 Visual */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-8xl font-black text-transparent bg-gradient-to-r from-brand-flame via-orange-400 to-brand-yellow bg-clip-text leading-none">
            4<span className="inline-block"><Flame className="w-16 h-16 text-brand-flame fill-brand-flame animate-bounce" /></span>4
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            This Page Got Burned!
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Looks like this page doesn't exist — but our flame-grilled pizzas and crispy smash burgers definitely do. Let's get you back to the menu.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 bg-gradient-to-r from-brand-flame to-brand-500 hover:from-orange-600 hover:to-orange-500 text-white font-black px-6 py-3 rounded-2xl shadow-glow-flame hover:scale-[1.03] transition-all text-sm uppercase tracking-wide"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/#menu"
            className="flex items-center gap-2 bg-brand-card hover:bg-brand-cardHover text-neutral-300 border border-brand-border px-6 py-3 rounded-2xl text-sm font-semibold transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Browse Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
}