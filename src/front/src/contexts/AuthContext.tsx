'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, AuthResponse, Role } from '@/lib/api';

interface AuthContextType {
  user: AuthResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isGestor: boolean;
  isSindico: boolean;
  condominioIds: number[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('sigac_token');
    const saved = localStorage.getItem('sigac_user');
    if (token && saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('sigac_token');
        localStorage.removeItem('sigac_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Login sem enviar token (evita 403 por token antigo/inválido)
    const base = typeof window !== 'undefined' ? '/api-back' : 'http://localhost:8080';
    let res: Response;
    try {
      res = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Não foi possível conectar. Verifique sua internet e tente novamente.');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string };
      const msg = err?.message;
      // Mensagens claras para o usuário (não mostrar "Forbidden", "Unauthorized", etc.)
      if (msg && !/forbidden|unauthorized/i.test(msg)) {
        throw new Error(msg);
      }
      if (res.status === 401) throw new Error('E-mail ou senha incorretos. Verifique e tente novamente.');
      if (res.status === 403) throw new Error('Acesso negado. Verifique seu e-mail e senha.');
      if (res.status >= 500) throw new Error('Erro no servidor. Tente novamente em alguns instantes.');
      throw new Error('Não foi possível entrar. Tente novamente.');
    }
    const data: AuthResponse = await res.json();
    localStorage.setItem('sigac_token', data.token);
    localStorage.setItem('sigac_user', JSON.stringify(data));
    setUser(data);
    if (data.role === 'SIGAC_ADMIN') router.push('/admin');
    else if (data.role === 'GESTOR' && data.condominioIds?.length) router.push(`/gestor?condominioId=${data.condominioIds[0]}`);
    else if (data.role === 'SINDICO' && data.condominioIds?.length) router.push(`/sindico?condominioId=${data.condominioIds[0]}`);
    else router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('sigac_token');
    localStorage.removeItem('sigac_user');
    setUser(null);
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'SIGAC_ADMIN',
    isGestor: user?.role === 'GESTOR',
    isSindico: user?.role === 'SINDICO',
    condominioIds: user?.condominioIds ?? [],
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
