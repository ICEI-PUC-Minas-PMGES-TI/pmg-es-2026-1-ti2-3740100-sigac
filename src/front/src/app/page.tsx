'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user?.role === 'SIGAC_ADMIN') router.replace('/admin');
    else if (user?.role === 'GESTOR' && user.condominioIds?.length) router.replace(`/gestor?condominioId=${user.condominioIds[0]}`);
    else if (user?.role === 'SINDICO' && user.condominioIds?.length) router.replace(`/sindico?condominioId=${user.condominioIds[0]}`);
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-login-bg flex items-center justify-center">
        <img src="/img/fundo-login.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center" aria-hidden />
        <div className="page-login-bg-overlay" />
        <div className="relative z-10">
          <LoadingSpinner message="Verificando sessão..." />
        </div>
      </div>
    );
  }

  return (
    <div className="page-login-bg flex items-center justify-center px-4 py-12">
      <img src="/img/fundo-login.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center" aria-hidden />
      <div className="page-login-bg-overlay" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="card text-center mb-8 flex flex-col items-center py-8 px-6 shadow-xl border-slate-100 bg-white">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            <Logo className="h-14 w-auto text-sigac-nav mb-4" />
          </motion.div>
          <p className="text-slate-600 text-sm max-w-xs">
            Sistema Integrado de Gestão e Administração Condominial
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          onSubmit={handleSubmit}
          className="card space-y-5 py-6 px-6 shadow-xl border-slate-100 bg-white"
        >
          <h2 className="text-xl font-semibold text-sigac-nav flex items-center gap-2">
            <LogIn className="w-5 h-5 text-sigac-accent" />
            Entrar
          </h2>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="toast-error text-sm flex items-center gap-2"
            >
              {error}
            </motion.div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                className="input pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                className="input pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Entrar
              </>
            )}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}
