'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PizziousLogo } from '@/components/PizziousLogo';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  FolderTree,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  Loader2,
  UserCog,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        if (data.success && data.user) {
          setAdminUser(data.user);
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        router.push('/admin/login');
      } finally {
        setCheckingAuth(false);
      }
    }

    checkSession();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f3f1ee] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-flame animate-spin" />
        <p className="text-[#555555] text-xs font-mono">Authenticating Admin Session...</p>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders & Payments', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Menu & Deals Builder', href: '/admin/items', icon: UtensilsCrossed },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Bank & Store Settings', href: '/admin/settings', icon: Settings },
    { label: 'Admin Account', href: '/admin/account', icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-[#f3f1ee] text-[#111111] flex flex-col md:flex-row">
      <div className="md:hidden border-b border-neutral-200 bg-white p-4 flex items-center justify-between">
        <PizziousLogo size="sm" href="/admin" />
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-[#f6f3ef] border border-neutral-200 text-[#111111]"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile-only backdrop: tapping outside the open sidebar closes it, and it
          blocks interaction with the page underneath while the menu is open —
          the same pattern the storefront CartDrawer already uses. */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 max-w-[80vw] bg-white border-r border-neutral-200 flex flex-col justify-between transition-transform duration-300 md:static md:max-w-none md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6">
          <div className="pb-4 border-b border-neutral-200">
            <PizziousLogo size="md" href="/admin" />
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-brand-flame uppercase tracking-[0.15em]">
              <Shield className="w-3 h-3" />
              <span>Admin Management Hub</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-flame text-white shadow-[0_8px_20px_rgba(255,69,0,0.25)]'
                      : 'text-[#555555] hover:text-[#111111] hover:bg-[#f6f3ef]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#555555]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-neutral-200 bg-[#faf7f3] p-4 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-[#111111] transition-colors hover:bg-[#f6f3ef]"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-brand-flame" />
              View Live Storefront
            </span>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <span className="max-w-[130px] truncate text-xs font-black text-[#111111]">
                {adminUser?.name || 'Pizzious Admin'}
              </span>
              <span className="max-w-[130px] truncate text-[10px] text-[#555555] font-mono">
                {adminUser?.email || 'admin@pizzious.com'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl p-2 text-[#555555] hover:bg-white hover:text-red-500 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="w-full max-w-7xl 2xl:max-w-[1600px] flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 mx-auto">
        <div className="rounded-[24px] border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}