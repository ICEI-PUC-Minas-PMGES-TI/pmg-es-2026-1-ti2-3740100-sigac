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
    const data = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
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
