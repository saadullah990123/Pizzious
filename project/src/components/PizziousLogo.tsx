import React from 'react';
import Link from 'next/link';

interface PizziousLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  logoType?: 'svg' | 'image';
  logoUrl?: string | null;
  href?: string;
}

export const PizziousLogo: React.FC<PizziousLogoProps> = ({
  className = '',
  size = 'md',
  logoType = 'svg',
  logoUrl,
  href = '/',
}) => {
  const sizeClasses = {
    sm: { icon: 'w-7 h-7', text: 'text-xl', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-2xl', sub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16', text: 'text-4xl', sub: 'text-sm' },
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 group cursor-pointer select-none ${className}`}>
      {logoType === 'image' && logoUrl ? (
        <img
          src={logoUrl}
          alt="Pizzious Logo"
          className={`${sizeClasses.icon} object-contain rounded-lg`}
        />
      ) : (
        <div className="relative flex items-center justify-center">
          {/* Glowing flame backdrop */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-flame to-brand-yellow rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className={`${sizeClasses.icon} relative z-10 bg-gradient-to-br from-brand-card to-brand-darker border border-brand-flame/40 rounded-xl p-1.5 flex items-center justify-center shadow-lg shadow-brand-flame/20 group-hover:scale-105 transition-transform duration-300`}>
            {/* Custom SVG Pizza Slice with Flaming Toppings */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-brand-yellow drop-shadow-[0_2px_4px_rgba(255,69,0,0.8)]"
            >
              <path
                d="M12 2L2 19.5C2 19.5 7 22 12 22C17 22 22 19.5 22 19.5L12 2Z"
                fill="url(#pizzaGrad)"
                stroke="#FF4500"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Pepperoni & Flame dots */}
              <circle cx="12" cy="10" r="1.8" fill="#FF4500" />
              <circle cx="8.5" cy="16" r="1.5" fill="#FF4500" />
              <circle cx="15.5" cy="16" r="1.5" fill="#FF4500" />
              <path
                d="M12 4.5C12 4.5 10.5 7 12 8.5C13.5 10 12 12 12 12"
                stroke="#FFD700"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="pizzaGrad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFA500" />
                  <stop offset="0.5" stopColor="#FF8C00" />
                  <stop offset="1" stopColor="#FF4500" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-black tracking-wider uppercase bg-gradient-to-r from-[#111111] via-[#111111] to-brand-flame bg-clip-text text-transparent font-sans ${sizeClasses.text}`}>
            PIZZI<span className="text-brand-flame">OUS</span>
          </span>
        </div>
        <span className={`font-semibold tracking-widest text-neutral-500 uppercase leading-none font-mono ${sizeClasses.sub}`}>
          CRAVE THE FLAME
        </span>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};