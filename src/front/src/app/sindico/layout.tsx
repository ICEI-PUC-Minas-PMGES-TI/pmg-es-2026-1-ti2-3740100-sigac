'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api, CondominioDTO } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { IconBanknote, IconDashboard, IconUser, IconUsers, IconWallet, IconWrench, IconLogout } from '@/components/Icons';

export default function SindicoLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isSindico } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [condominios, setCondominios] = useState<CondominioDTO[]>([]);
  const [currentCond, setCurrentCond] = useState<CondominioDTO | null>(null);

  useEffect(() => {
    if (!loading && !isSindico) router.replace('/');
  }, [loading, isSindico, router]);

  useEffect(() => {
    if (!user) return;
    api<CondominioDTO[]>('/condominios').then((list) => {
      setCondominios(list);
      const id = condominioId ? Number(condominioId) : list[0]?.id;
      if (id) setCurrentCond(list.find((c) => c.id === id) ?? list[0] ?? null);
      else setCurrentCond(list[0] ?? null);
    });
  }, [user, condominioId]);

  useEffect(() => {
    if (currentCond && !condominioId) router.replace(`/sindico?condominioId=${currentCond.id}`);
  }, [currentCond, condominioId, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-sigac-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-sigac-accent border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-600">Carregando...</p>
      </div>
    </div>
  );
  if (!user || !isSindico) return null;

  const cid = currentCond?.id ?? '';
  const navLinks = [
    { href: `/sindico?condominioId=${cid}`, label: 'Dashboard', active: pathname === '/sindico', icon: IconDashboard },
    { href: `/sindico/funcionarios?condominioId=${cid}`, label: 'Funcionários', active: pathname.startsWith('/sindico/funcionarios'), icon: IconUser },
    { href: `/sindico/inquilinos?condominioId=${cid}`, label: 'Inquilinos', active: pathname.startsWith('/sindico/inquilinos'), icon: IconUsers },
    { href: `/sindico/gastos?condominioId=${cid}`, label: 'Gastos', active: pathname.startsWith('/sindico/gastos'), icon: IconWallet },
    { href: `/sindico/arrecadacao?condominioId=${cid}`, label: 'Arrecadação', active: pathname.startsWith('/sindico/arrecadacao'), icon: IconBanknote },
    { href: `/sindico/manutencoes?condominioId=${cid}`, label: 'Manutenções', active: pathname.startsWith('/sindico/manutencoes'), icon: IconWrench },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="fixed left-0 top-0 h-screen w-56 bg-sigac-nav text-white flex flex-col z-10">
        <div className="p-4 border-b border-white/10 shrink-0">
          <Link href={`/sindico?condominioId=${cid}`} className="flex items-center gap-2 text-white hover:opacity-90 [&_svg]:text-white">
            <Logo className="h-9 w-auto" />
          </Link>
          <span className="block text-xs text-white/70 mt-1">Síndico</span>
        </div>
        <p className="px-4 py-2 text-white/60 text-xs shrink-0">Apenas visualização</p>
        {condominios.length > 1 && (
          <div className="p-2 shrink-0">
            <select
              className="w-full bg-white/10 text-white rounded-lg px-2 py-1.5 text-sm border border-white/20"
              value={cid}
              onChange={(e) => router.push(`/sindico?condominioId=${e.target.value}`)}
            >
              {condominios.map((c) => (
                <option key={c.id} value={c.id} className="text-sigac-nav">{c.nome}</option>
              ))}
            </select>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto p-2 min-h-0">
          {navLinks.map(({ href, label, active, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition ${active ? 'bg-sigac-accent text-white' : 'hover:bg-white/10 text-white/90'}`}
            >
              <Icon className="shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 shrink-0">
          <p className="text-sm text-white/80 truncate">{user.nome || user.email}</p>
          <Link href={`/sindico/perfil?condominioId=${cid}`} className="flex items-center gap-2 text-sm text-white/70 hover:text-white mt-1">
            <IconUser className="shrink-0" />
            Perfil
          </Link>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-white/70 hover:text-white mt-1">
            <IconLogout className="shrink-0" />
            Sair
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 ml-56 min-h-screen">
        <header className="h-14 shrink-0 bg-white/95 backdrop-blur border-b border-sigac-border flex items-center px-6 gap-4 shadow-sm">
          <Link href={`/sindico?condominioId=${cid}`} className="flex items-center text-sigac-nav shrink-0">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex-1 flex justify-center min-w-0">
            {currentCond && (
              <span className="text-base font-semibold text-sigac-nav bg-sigac-nav/10 px-4 py-1.5 rounded-lg truncate max-w-[280px]" title={currentCond.nome}>
                {currentCond.nome}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/sindico/perfil?condominioId=${cid}`} className="text-sm font-medium text-sigac-nav hover:text-sigac-accent truncate max-w-[180px]" title={user.nome || user.email}>
              {user.nome || user.email}
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 main-internal-bg">
          <img src="/img/fundo.png" alt="" className="main-internal-bg-img" aria-hidden />
          <div className="main-internal-bg-overlay" />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
