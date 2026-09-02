'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Extra classes to merge onto the wrapper (e.g. 'animate-float-slow') */
  className?: string;
  /** Delay in ms before the reveal animation starts, for staggered grids */
  delay?: number;
  /** Element tag to render as. Defaults to 'div'. */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Wraps children with the .reveal-on-scroll CSS class (defined in globals.css)
 * and toggles .in-view via IntersectionObserver the first time the element
 * enters the viewport. Animation only plays once per element.
 */
export function ScrollReveal({ children, className = '', delay = 0, as = 'div' }: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // If IntersectionObserver isn't available, just show the content immediately.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              window.setTimeout(() => setInView(true), delay);
            } else {
              setInView(true);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  const Tag = as as any;

  return (
    <Tag ref={ref} className={`reveal-on-scroll ${inView ? 'in-view' : ''} ${className}`}>
      {children}
    </Tag>
  );
}
