'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api, CondominioDTO, SolicitacaoManutencaoContagemDTO } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { IconBanknote, IconDashboard, IconBuilding, IconUser, IconUsers, IconWallet, IconWrench, IconLogout, IconBell } from '@/components/Icons';

export default function GestorLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isGestor } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [condominios, setCondominios] = useState<CondominioDTO[]>([]);
  const [currentCond, setCurrentCond] = useState<CondominioDTO | null>(null);
  const [solicManutencaoCount, setSolicManutencaoCount] = useState(0);

  useEffect(() => {
    if (!loading && !isGestor) router.replace('/');
  }, [loading, isGestor, router]);

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
    if (currentCond && !condominioId) router.replace(`/gestor?condominioId=${currentCond.id}`);
  }, [currentCond, condominioId, router]);

  useEffect(() => {
    if (!user || !currentCond?.id) return;
    const id = currentCond.id;
    let cancelled = false;
    const fetchCount = () => {
      api<SolicitacaoManutencaoContagemDTO>(`/condominios/${id}/solicitacoes-manutencao/contagem`)
        .then((c) => {
          if (!cancelled) setSolicManutencaoCount(Number(c.total));
        })
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 45_000);
    const onSolicChange = () => {
      if (!cancelled) fetchCount();
    };
    window.addEventListener('sigac-solic-manutencao-changed', onSolicChange);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('sigac-solic-manutencao-changed', onSolicChange);
    };
  }, [user, currentCond?.id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-sigac-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-sigac-accent border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-600">Carregando...</p>
      </div>
    </div>
  );
  if (!user || !isGestor) return null;

  const cid = currentCond?.id ?? '';
  const navLinks = [
    { href: `/gestor?condominioId=${cid}`, label: 'Dashboard', active: pathname === '/gestor', icon: IconDashboard, badge: 0 },
    { href: `/gestor/funcionarios?condominioId=${cid}`, label: 'Funcionários', active: pathname.startsWith('/gestor/funcionarios'), icon: IconUser, badge: 0 },
    { href: `/gestor/inquilinos?condominioId=${cid}`, label: 'Inquilinos', active: pathname.startsWith('/gestor/inquilinos'), icon: IconUsers, badge: 0 },
    { href: `/gestor/avisos?condominioId=${cid}`, label: 'Avisos', active: pathname.startsWith('/gestor/avisos'), icon: IconBell, badge: 0 },
    { href: `/gestor/gastos?condominioId=${cid}`, label: 'Gastos (produtos)', active: pathname.startsWith('/gestor/gastos'), icon: IconWallet, badge: 0 },
    { href: `/gestor/arrecadacao?condominioId=${cid}`, label: 'Arrecadação', active: pathname.startsWith('/gestor/arrecadacao'), icon: IconBanknote, badge: 0 },
    { href: `/gestor/manutencoes?condominioId=${cid}`, label: 'Manutenções', active: pathname.startsWith('/gestor/manutencoes'), icon: IconWrench, badge: solicManutencaoCount },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="fixed left-0 top-0 h-screen w-56 bg-sigac-nav text-white flex flex-col z-10">
        <div className="p-4 border-b border-white/10 shrink-0">
          <Link href={`/gestor?condominioId=${cid}`} className="flex items-center gap-2 text-white hover:opacity-90 [&_svg]:text-white">
            <Logo className="h-9 w-auto" />
          </Link>
          <span className="block text-xs text-white/70 mt-1">Gestor</span>
        </div>
        {condominios.length > 1 && (
          <div className="p-2 shrink-0">
            <select
              className="w-full bg-white/10 text-white rounded-lg px-2 py-1.5 text-sm border border-white/20"
              value={cid}
              onChange={(e) => router.push(`/gestor?condominioId=${e.target.value}`)}
            >
              {condominios.map((c) => (
                <option key={c.id} value={c.id} className="text-sigac-nav">{c.nome}</option>
              ))}
            </select>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto p-2 min-h-0">
          {navLinks.map(({ href, label, active, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition ${active ? 'bg-sigac-accent text-white' : 'hover:bg-white/10 text-white/90'}`}
            >
              <Icon className="shrink-0" />
              <span className="flex-1 min-w-0">{label}</span>
              {badge > 0 && (
                <span className="shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-amber-400 text-sigac-nav text-xs font-bold flex items-center justify-center" title="Solicitações do síndico pendentes">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 shrink-0">
          <p className="text-sm text-white/80 truncate">{user.nome || user.email}</p>
          <Link href={`/gestor/perfil?condominioId=${cid}`} className="flex items-center gap-2 text-sm text-white/70 hover:text-white mt-1">
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
          <Link href={`/gestor?condominioId=${cid}`} className="flex items-center text-sigac-nav shrink-0">
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
            <Link href={`/gestor/perfil?condominioId=${cid}`} className="text-sm font-medium text-sigac-nav hover:text-sigac-accent truncate max-w-[180px]" title={user.nome || user.email}>
              {user.nome || user.email}
            </Link>
          </div>
        </header>
        {solicManutencaoCount > 0 && (
          <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm text-amber-950">
            <p>
              <strong>{solicManutencaoCount === 1 ? 'Há 1 solicitação' : `Há ${solicManutencaoCount} solicitações`}</strong> de manutenção do síndico aguardando sua análise.
            </p>
            <Link
              href={`/gestor/manutencoes?condominioId=${cid}`}
              className="font-semibold text-amber-900 underline decoration-amber-400 hover:text-amber-800"
            >
              Ver na página de manutenções
            </Link>
          </div>
        )}
        <main className="flex-1 overflow-auto p-6 main-internal-bg">
          <img src="/img/fundo.png" alt="" className="main-internal-bg-img" aria-hidden />
          <div className="main-internal-bg-overlay" />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
