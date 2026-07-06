import { Suspense } from 'react';
import SindicoLayoutClient from './SindicoLayoutClient';

export const dynamic = 'force-dynamic';

function SindicoLayoutFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sigac-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-sigac-accent border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-600">Carregando...</p>
      </div>
    </div>
  );
}

export default function SindicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<SindicoLayoutFallback />}>
      <SindicoLayoutClient>{children}</SindicoLayoutClient>
    </Suspense>
  );
}
