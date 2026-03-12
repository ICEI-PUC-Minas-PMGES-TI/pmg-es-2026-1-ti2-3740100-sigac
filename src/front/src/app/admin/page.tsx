'use client';

import { useEffect, useState } from 'react';
import { api, CondominioDTO, UserDTO } from '@/lib/api';

export default function AdminPage() {
  const [condominios, setCondominios] = useState<CondominioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [gestores, setGestores] = useState<UserDTO[]>([]);
  const [sindicos, setSindicos] = useState<UserDTO[]>([]);
  const [showFormCond, setShowFormCond] = useState(false);
  const [showFormGestor, setShowFormGestor] = useState(false);
  const [showFormSindico, setShowFormSindico] = useState(false);
  const [formCond, setFormCond] = useState({ nome: '', endereco: '', cnpj: '' });
  const [formUser, setFormUser] = useState({ nome: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCondominios = () => api<CondominioDTO[]>('/condominios').then(setCondominios);

  useEffect(() => {
    loadCondominios().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setGestores([]);
      setSindicos([]);
      return;
    }
    api<UserDTO[]>(`/condominios/${selectedId}/gestores`).then(setGestores);
    api<UserDTO[]>(`/condominios/${selectedId}/sindicos`).then(setSindicos);
  }, [selectedId]);

  const handleCreateCondominio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api('/condominios', {
        method: 'POST',
        body: JSON.stringify(formCond),
      });
      setFormCond({ nome: '', endereco: '', cnpj: '' });
      setShowFormCond(false);
      loadCondominios();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateGestor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${selectedId}/gestores`, {
        method: 'POST',
        body: JSON.stringify({ ...formUser, role: 'GESTOR' }),
      });
      setFormUser({ nome: '', email: '', password: '' });
      setShowFormGestor(false);
      api<UserDTO[]>(`/condominios/${selectedId}/gestores`).then(setGestores);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSindico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${selectedId}/sindicos`, {
        method: 'POST',
        body: JSON.stringify({ ...formUser, role: 'SINDICO' }),
      });
      setFormUser({ nome: '', email: '', password: '' });
      setShowFormSindico(false);
      api<UserDTO[]>(`/condominios/${selectedId}/sindicos`).then(setSindicos);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-sigac-accent">Carregando condomínios...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-sigac-nav">Condomínios</h1>
        <button onClick={() => { setShowFormCond(true); setError(''); }} className="btn-primary">
          Novo condomínio
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">{error}</div>
      )}

      {showFormCond && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Criar condomínio</h2>
          <form onSubmit={handleCreateCondominio} className="space-y-3 max-w-md">
            <input className="input" placeholder="Nome" value={formCond.nome} onChange={(e) => setFormCond((f) => ({ ...f, nome: e.target.value }))} required />
            <input className="input" placeholder="Endereço" value={formCond.endereco} onChange={(e) => setFormCond((f) => ({ ...f, endereco: e.target.value }))} />
            <input className="input" placeholder="CNPJ" value={formCond.cnpj} onChange={(e) => setFormCond((f) => ({ ...f, cnpj: e.target.value }))} />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Salvando...' : 'Criar'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowFormCond(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">Lista de condomínios</h2>
          <ul className="space-y-2">
            {condominios.map((c) => (
              <li
                key={c.id}
                className={`p-3 rounded-lg border cursor-pointer ${selectedId === c.id ? 'border-sigac-accent bg-sigac-accent/10' : 'border-sigac-border hover:bg-slate-50'}`}
                onClick={() => setSelectedId(c.id)}
              >
                <span className="font-medium">{c.nome}</span>
                {c.endereco && <span className="block text-sm text-gray-500">{c.endereco}</span>}
              </li>
            ))}
          </ul>
        </div>

        {selectedId && (
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-3">Gestores e síndicos</h2>
            <p className="text-sm text-gray-500 mb-3">Condomínio selecionado: {condominios.find((c) => c.id === selectedId)?.nome}</p>
            <div className="flex gap-2 mb-4">
              <button onClick={() => { setShowFormGestor(true); setShowFormSindico(false); setError(''); }} className="btn-primary text-sm">
                + Gestor
              </button>
              <button onClick={() => { setShowFormSindico(true); setShowFormGestor(false); setError(''); }} className="btn-secondary text-sm">
                + Síndico
              </button>
            </div>

            {showFormGestor && (
              <form onSubmit={handleCreateGestor} className="space-y-2 p-3 bg-gray-50 rounded-lg mb-3">
                <input className="input text-sm" placeholder="Nome" value={formUser.nome} onChange={(e) => setFormUser((f) => ({ ...f, nome: e.target.value }))} required />
                <input type="email" className="input text-sm" placeholder="E-mail" value={formUser.email} onChange={(e) => setFormUser((f) => ({ ...f, email: e.target.value }))} required />
                <input type="password" className="input text-sm" placeholder="Senha" value={formUser.password} onChange={(e) => setFormUser((f) => ({ ...f, password: e.target.value }))} required />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-sm" disabled={submitting}>Criar gestor</button>
                  <button type="button" className="btn-secondary text-sm" onClick={() => setShowFormGestor(false)}>Cancelar</button>
                </div>
              </form>
            )}

            {showFormSindico && (
              <form onSubmit={handleCreateSindico} className="space-y-2 p-3 bg-gray-50 rounded-lg mb-3">
                <input className="input text-sm" placeholder="Nome" value={formUser.nome} onChange={(e) => setFormUser((f) => ({ ...f, nome: e.target.value }))} required />
                <input type="email" className="input text-sm" placeholder="E-mail" value={formUser.email} onChange={(e) => setFormUser((f) => ({ ...f, email: e.target.value }))} required />
                <input type="password" className="input text-sm" placeholder="Senha" value={formUser.password} onChange={(e) => setFormUser((f) => ({ ...f, password: e.target.value }))} required />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-sm" disabled={submitting}>Criar síndico</button>
                  <button type="button" className="btn-secondary text-sm" onClick={() => setShowFormSindico(false)}>Cancelar</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Gestores</p>
              {gestores.length === 0 ? <p className="text-sm text-gray-400">Nenhum gestor</p> : gestores.map((g) => <div key={g.id} className="text-sm">{g.nome} — {g.email}</div>)}
              <p className="text-sm font-medium text-gray-600 mt-2">Síndicos</p>
              {sindicos.length === 0 ? <p className="text-sm text-gray-400">Nenhum síndico</p> : sindicos.map((s) => <div key={s.id} className="text-sm">{s.nome} — {s.email}</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
