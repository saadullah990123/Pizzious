import React from 'react';
import Link from 'next/link';
import { PizziousLogo } from './PizziousLogo';
import { Footer } from './Footer';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/db';

interface StaticPageLayoutProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export const StaticPageLayout: React.FC<StaticPageLayoutProps> = async ({
  title,
  lastUpdated,
  children,
}) => {
  const settings = await db.getSettings().catch(() => null);

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f1ee]">
      <header className="bg-white border-b border-neutral-200 py-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <PizziousLogo size="sm" />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-brand-flame transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111111] mb-1">
          {title}
        </h1>
        {lastUpdated && (
          <p className="text-xs text-neutral-500 font-medium mb-8">Last updated: {lastUpdated}</p>
        )}
        <div className="prose prose-sm sm:prose-base max-w-none text-[#333333] space-y-5 leading-relaxed [&_h2]:text-lg [&_h2]:font-black [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-[#111111] [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:text-sm [&_li]:text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </div>
      </main>

      <Footer settings={settings as any} />
    </div>
  );
};
