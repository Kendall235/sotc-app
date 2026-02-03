import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-primary bg-grid relative overflow-hidden">
      {/* Warm atmospheric glow */}
      <div
        className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-gold-glow) 0%, var(--color-brick-glow) 30%, transparent 65%)',
        }}
      />

      {/* Subtle resin texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
