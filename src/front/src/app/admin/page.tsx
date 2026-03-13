'use client';

import { useEffect, useState } from 'react';
import { api, CondominioDTO, UserDTO } from '@/lib/api';
import { IconEdit, IconTrash } from '@/components/Icons';

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
  const [editing, setEditing] = useState<{ tipo: 'GESTOR' | 'SINDICO'; user: UserDTO } | null>(null);
  const [editForm, setEditForm] = useState({ nome: '', email: '', novaSenha: '' });
  const [deletingUser, setDeletingUser] = useState<{ tipo: 'GESTOR' | 'SINDICO'; user: UserDTO } | null>(null);

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

  const reloadUsers = (condId: number) => {
    api<UserDTO[]>(`/condominios/${condId}/gestores`).then(setGestores);
    api<UserDTO[]>(`/condominios/${condId}/sindicos`).then(setSindicos);
  };

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
      reloadUsers(selectedId);
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
      reloadUsers(selectedId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditUser = (tipo: 'GESTOR' | 'SINDICO', user: UserDTO) => {
    setEditing({ tipo, user });
    setEditForm({ nome: user.nome, email: user.email, novaSenha: '' });
    setError('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !editing) return;
    setError('');
    setSubmitting(true);
    try {
      const pathRole = editing.tipo === 'GESTOR' ? 'gestores' : 'sindicos';
      const payload: { nome: string; email: string; novaSenha?: string } = { nome: editForm.nome, email: editForm.email };
      if (editForm.novaSenha.trim()) payload.novaSenha = editForm.novaSenha;
      await api(`/condominios/${selectedId}/${pathRole}/${editing.user.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setEditing(null);
      reloadUsers(selectedId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (tipo: 'GESTOR' | 'SINDICO', user: UserDTO) => {
    if (!selectedId) return;
    setError('');
    setSubmitting(true);
    try {
      const pathRole = tipo === 'GESTOR' ? 'gestores' : 'sindicos';
      await api(`/condominios/${selectedId}/${pathRole}/${user.id}`, {
        method: 'DELETE',
      });
      if (editing && editing.user.id === user.id) {
        setEditing(null);
      }
      setDeletingUser(null);
      reloadUsers(selectedId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao remover usuário');
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
              {gestores.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum gestor</p>
              ) : (
                gestores.map((g) => (
                  <div key={g.id} className="flex items-center justify-between text-sm border-b border-slate-100 py-1">
                    <span>{g.nome} - {g.email}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" className="p-1.5 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors" onClick={() => startEditUser('GESTOR', g)} title="Editar" aria-label="Editar">
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button type="button" className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors" onClick={() => setDeletingUser({ tipo: 'GESTOR', user: g })} title="Remover" aria-label="Remover">
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <p className="text-sm font-medium text-gray-600 mt-2">Síndicos</p>
              {sindicos.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum síndico</p>
              ) : (
                sindicos.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm border-b border-slate-100 py-1">
                    <span>{s.nome} - {s.email}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" className="p-1.5 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors" onClick={() => startEditUser('SINDICO', s)} title="Editar" aria-label="Editar">
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button type="button" className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors" onClick={() => setDeletingUser({ tipo: 'SINDICO', user: s })} title="Remover" aria-label="Remover">
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {editing && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-sm font-semibold text-sigac-nav mb-2">
                  Editar {editing.tipo === 'GESTOR' ? 'gestor' : 'síndico'}
                </h3>
                <form onSubmit={handleUpdateUser} className="space-y-2">
                  <input
                    className="input text-sm"
                    placeholder="Nome"
                    value={editForm.nome}
                    onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))}
                    required
                  />
                  <input
                    type="email"
                    className="input text-sm"
                    placeholder="E-mail"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                  <div>
                    <label className="text-xs text-slate-500 block mb-0.5">Nova senha (opcional)</label>
                    <input
                      type="text"
                      className="input text-sm"
                      placeholder="Deixe em branco para não alterar"
                      value={editForm.novaSenha}
                      onChange={(e) => setEditForm((f) => ({ ...f, novaSenha: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary text-sm" disabled={submitting}>
                      {submitting ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary text-sm"
                      onClick={() => setEditing(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {deletingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <p className="text-slate-800 font-medium mb-4">
              Excluir este {deletingUser.tipo === 'GESTOR' ? 'gestor' : 'síndico'}? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setDeletingUser(null)}>Cancelar</button>
              <button type="button" className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg" disabled={submitting} onClick={() => handleDeleteUser(deletingUser.tipo, deletingUser.user)}>
                {submitting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
