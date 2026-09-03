'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PizziousLogo } from '@/components/PizziousLogo';
import { Shield, Lock, Mail, AlertCircle, Loader2, ArrowRight, Clock } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionExpiredReason, setSessionExpiredReason] = useState<'expired' | 'inactivity' | null>(null);

  useEffect(() => {
    const reason = searchParams.get('reason');
    setSessionExpired(reason === 'expired' || reason === 'inactivity');
    setSessionExpiredReason(reason === 'expired' || reason === 'inactivity' ? reason : null);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      sessionStorage.setItem('pizzious_admin_tab_session', 'active');
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1ee] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <PizziousLogo size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-[#111111]">
            <Shield className="h-3.5 w-3.5 text-brand-flame" />
            <span>Authorized Personnel Portal</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111111]">Admin Management Login</h1>
          <p className="text-xs text-[#555555]">
            Enter your administrative credentials to manage orders, deals, menu, and payment settings.
          </p>
        </div>

        <div className="space-y-6 rounded-[28px] border border-neutral-200 bg-white p-6 shadow-xl sm:p-8">
          {sessionExpired && !error && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {sessionExpiredReason === 'inactivity'
                  ? 'Session expired due to inactivity.'
                  : 'Your session expired. Please sign in again to continue.'}
              </span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#111111]">Admin Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pizzious.com"
                  className="w-full rounded-xl border border-neutral-300 bg-[#faf8f5] pl-10 pr-4 py-2.5 text-sm text-[#111111] placeholder:text-neutral-500 focus:border-brand-flame focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#111111]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-neutral-300 bg-[#faf8f5] pl-10 pr-4 py-2.5 text-sm text-[#111111] placeholder:text-neutral-500 focus:border-brand-flame focus:outline-none"
                />
              </div>
            </div>

            {process.env.NODE_ENV !== 'production' && (
              <div className="space-y-1 rounded-xl border border-neutral-200 bg-[#f7f5f2] p-3 text-[11px] text-[#555555]">
                <p className="font-semibold text-brand-flame">Demo Access (dev only — hidden in production):</p>
                <p>Email: <span className="font-mono text-[#111111]">admin@pizzious.com</span></p>
                <p>Password: <span className="font-mono text-[#111111]">PizziousAdmin2026!</span></p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-flame to-brand-500 py-3.5 px-6 text-sm font-black uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(255,69,0,0.25)] transition-all hover:from-orange-600 hover:to-orange-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <a href="/" className="text-xs text-[#555555] transition-colors hover:text-[#111111]">
            ← Return to Storefront
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#f3f1ee] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-brand-flame animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </React.Suspense>
  );
}