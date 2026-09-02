'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/utils';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phoneNumber = '+923251020222',
  defaultMessage = 'Hi Pizzious! I want to check today’s hot deals and place an order.',
}) => {
  const [showTooltip, setShowTooltip] = useState(true);
  const whatsappUrl = getWhatsAppUrl(phoneNumber, defaultMessage);

  return (
    <div className="safe-bottom fixed bottom-4 right-4 z-50 flex items-end gap-3 pointer-events-auto sm:bottom-6 sm:right-6">
      {/* Interactive Tooltip Card */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-3 bg-brand-card/95 backdrop-blur-md border border-brand-border text-white px-4 py-2.5 rounded-2xl shadow-2xl shadow-black/80 text-sm animate-fade-in max-w-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <div className="flex-1">
            <p className="font-semibold text-xs text-emerald-400">Order via WhatsApp</p>
            <p className="text-xs text-neutral-500">Live agent online & ready</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-neutral-400 hover:text-white p-0.5 rounded-md hover:bg-neutral-800 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pulsing Glowing Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#25D366] text-white shadow-[0_5px_18px_rgba(37,211,102,0.5),0_0_0_5px_rgba(37,211,102,0.16)] transition-transform duration-300 hover:scale-110 active:scale-95"
      >
        {/* Glow Ring */}
        <div className="absolute -inset-1 rounded-full border-2 border-[#25D366] opacity-50 animate-whatsapp-glow group-hover:opacity-80" />
        
        {/* WhatsApp mark: phone handset inside the brand speech bubble */}
        <svg viewBox="0 0 32 32" className="relative z-10 h-9 w-9 fill-none stroke-current drop-shadow-md" aria-hidden="true">
          <path d="M7.2 24.8 8.5 20A10.5 10.5 0 1 1 12 23.5l-4.8 1.3Z" strokeWidth="2.1" />
          <path d="M12.1 11.8c.3-.7.6-.7 1.1-.7h.7c.3 0 .6.1.8.6l.9 2.2c.1.3.1.6-.1.8l-.8.9c-.2.2-.2.4 0 .7.6 1 1.6 1.9 2.7 2.4.3.2.5.2.7-.1l.9-1.1c.2-.3.5-.3.8-.2l2.2 1c.3.1.5.3.5.7 0 .8-.3 1.5-.9 2-.5.4-1.2.6-1.9.4-1.7-.4-3.4-1.3-4.8-2.6-1.4-1.3-2.5-2.8-3.1-4.4-.3-.8-.3-1.7.3-2.6Z" fill="currentColor" stroke="none" />
        </svg>
      </a>
    </div>
  );
};