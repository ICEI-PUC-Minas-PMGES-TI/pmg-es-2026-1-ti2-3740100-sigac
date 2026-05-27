'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Mail, Shield, Lock, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-2xl mx-auto px-4 sm:px-0 flex flex-col items-center"
    >
      <div className="w-full space-y-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-sigac-accent hover:text-sigac-accent-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-sigac-nav flex items-center justify-center gap-2">
            <User className="w-8 h-8 text-sigac-accent" />
            Meu perfil
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Dados da sua conta. Você pode alterar sua senha abaixo.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-sigac-nav mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-sigac-accent" />
            Dados da conta
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-sigac-accent/10 text-sigac-accent shrink-0">
                <User className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nome</dt>
                <dd className="text-slate-800 font-medium mt-0.5 truncate" title={user.nome || '—'}>{user.nome || '—'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-sigac-accent/10 text-sigac-accent shrink-0">
                <Mail className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">E-mail</dt>
                <dd className="text-slate-800 font-medium mt-0.5 truncate" title={user.email}>{user.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-sigac-accent/10 text-sigac-accent shrink-0">
                <Shield className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Função</dt>
                <dd className="text-slate-800 font-medium mt-0.5">{ROLE_LABEL[user.role] ?? user.role}</dd>
              </div>
            </div>
          </dl>
        </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h2 className="text-lg font-semibold text-sigac-nav mb-2 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-sigac-accent" />
          Alterar senha
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Quem criou sua conta definiu uma senha inicial. Você pode trocá-la aqui quando quiser.
        </p>
        <form onSubmit={handleAlterarSenha} className="space-y-4">
          <AnimatePresence mode="wait">
            {erro && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="toast-error fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[min(720px,calc(100%-2rem))] flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {erro}
              </motion.div>
            )}
            {sucesso && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="toast-success flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                Senha alterada com sucesso. Use a nova senha no próximo login.
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha atual</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                className="input pl-10"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nova senha</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                className="input pl-10"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Mínimo 6 caracteres.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar nova senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                className="input pl-10"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <motion.button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={salvando}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {salvando ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  Alterar senha
                </>
              )}
            </motion.button>
            <Link href={backHref} className="btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </motion.div>
      </div>
    </motion.div>
  );
}
