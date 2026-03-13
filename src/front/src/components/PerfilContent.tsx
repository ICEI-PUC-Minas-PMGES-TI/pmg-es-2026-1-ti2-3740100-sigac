'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

const ROLE_LABEL: Record<string, string> = {
  SIGAC_ADMIN: 'Administrador',
  GESTOR: 'Gestor',
  SINDICO: 'Síndico',
};

export function PerfilContent({ backHref }: { backHref: string }) {
  const { user } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    if (novaSenha !== confirmarSenha) {
      setErro('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setSalvando(true);
    try {
      await api<void>('/me/senha', {
        method: 'PUT',
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      setSucesso(true);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Não foi possível alterar a senha.');
    } finally {
      setSalvando(false);
    }
  };

  if (!user) return null;

  return (
    <div className="animate-fade-in max-w-2xl">
      <Link href={backHref} className="text-sm text-sigac-accent hover:underline mb-4 inline-block">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-bold text-sigac-nav mb-1">Meu perfil</h1>
      <p className="text-sm text-slate-600 mb-6">
        Dados da sua conta. Você pode alterar sua senha abaixo.
      </p>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-sigac-nav mb-3">Dados da conta</h2>
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-slate-500 font-medium">Nome</dt>
            <dd className="text-slate-800">{user.nome || '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500 font-medium">E-mail</dt>
            <dd className="text-slate-800">{user.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500 font-medium">Função</dt>
            <dd className="text-slate-800">{ROLE_LABEL[user.role] ?? user.role}</dd>
          </div>
        </dl>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-sigac-nav mb-3">Alterar senha</h2>
        <p className="text-sm text-slate-600 mb-4">
          Quem criou sua conta definiu uma senha inicial. Você pode trocá-la aqui quando quiser.
        </p>
        <form onSubmit={handleAlterarSenha} className="space-y-4">
          {erro && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              Senha alterada com sucesso.
            </div>
          )}
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Senha atual</span>
            <input
              type="password"
              className="input w-full mt-1"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nova senha</span>
            <input
              type="password"
              className="input w-full mt-1"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <p className="text-xs text-slate-500 mt-0.5">Mínimo 6 caracteres.</p>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Confirmar nova senha</span>
            <input
              type="password"
              className="input w-full mt-1"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Alterar senha'}
            </button>
            <Link href={backHref} className="btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
