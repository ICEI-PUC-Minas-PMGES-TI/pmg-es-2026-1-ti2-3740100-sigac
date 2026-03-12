'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { IconBuilding, IconLogout } from '@/components/Icons';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) router.replace('/');
  }, [loading, isAdmin, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-sigac-bg">Carregando...</div>;
  if (!user || !isAdmin) return null;

  const nav = [
    { href: '/admin', label: 'Condomínios', icon: IconBuilding },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="fixed left-0 top-0 h-screen w-56 bg-sigac-nav text-white flex flex-col z-10">
        <div className="p-4 border-b border-white/10 shrink-0">
          <Link href="/admin" className="flex items-center gap-2 text-white hover:opacity-90 [&_svg]:text-white">
            <Logo className="h-9 w-auto" />
          </Link>
          <span className="block text-xs text-white/70 mt-1">Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 min-h-0">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition ${pathname === href ? 'bg-sigac-accent text-white' : 'hover:bg-white/10 text-white/90'}`}
            >
              <Icon className="shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 shrink-0">
          <p className="text-sm text-white/80 truncate">{user.email}</p>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-white/70 hover:text-white mt-1">
            <IconLogout className="shrink-0" />
            Sair
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 ml-56 min-h-screen">
        <header className="h-14 shrink-0 bg-white border-b border-sigac-border flex items-center px-6 gap-4">
          <Link href="/admin" className="flex items-center text-sigac-nav">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex-1" />
          <span className="text-sm text-slate-600 truncate max-w-[200px]">{user.email}</span>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-sigac-bg">{children}</main>
      </div>
    </div>
  );
}
