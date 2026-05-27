'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, UserCog, UserCheck, Pencil, Trash2 } from 'lucide-react';
import { api, CondominioDTO, UserDTO } from '@/lib/api';
import { LoadingSpinner, TableSkeleton } from '@/components/LoadingSpinner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { FormModal } from '@/components/FormModal';

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

  const normalizeCnpj = (raw: string) => raw.trim().replace(/[^0-9a-zA-Z]/g, '').toUpperCase();

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
      const cnpj = formCond.cnpj?.trim() ? normalizeCnpj(formCond.cnpj) : '';
      await api('/condominios', {
        method: 'POST',
        body: JSON.stringify({ ...formCond, cnpj }),
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton rounded-lg" />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-sigac-nav flex items-center gap-2">
          <Building2 className="w-8 h-8 text-sigac-accent" />
          Condomínios
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setShowFormCond(true); setError(''); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo condomínio
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="toast-error fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[min(720px,calc(100%-2rem))]"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <FormModal
        open={showFormCond}
        onClose={() => setShowFormCond(false)}
        title="Criar condomínio"
        icon={<Building2 className="w-5 h-5 text-sigac-accent" />}
      >
        <form onSubmit={handleCreateCondominio} className="space-y-3">
          <input className="input" placeholder="Nome" value={formCond.nome} onChange={(e) => setFormCond((f) => ({ ...f, nome: e.target.value }))} required />
          <input className="input" placeholder="Endereço" value={formCond.endereco} onChange={(e) => setFormCond((f) => ({ ...f, endereco: e.target.value }))} />
          <input
            className="input"
            placeholder="CNPJ (14 caracteres, alfanumérico)"
            value={formCond.cnpj}
            onChange={(e) => setFormCond((f) => ({ ...f, cnpj: e.target.value.toUpperCase() }))}
            inputMode="text"
            autoCapitalize="characters"
          />
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Criar'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowFormCond(false)}>Cancelar</button>
          </div>
        </form>
      </FormModal>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="card"
        >
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sigac-accent" />
            Lista de condomínios
          </h2>
          <ul className="space-y-2">
            {condominios.map((c, i) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * i }}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${selectedId === c.id ? 'border-sigac-accent bg-sigac-accent/10 shadow-sm' : 'border-sigac-border hover:bg-slate-50 hover:border-slate-200'}`}
                onClick={() => setSelectedId(c.id)}
              >
                <span className="font-medium text-slate-800">{c.nome}</span>
                {c.endereco && <span className="block text-sm text-slate-500 mt-0.5">{c.endereco}</span>}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {selectedId && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <UserCog className="w-5 h-5 text-sigac-accent" />
              Gestores e síndicos
            </h2>
            <p className="text-sm text-slate-500 mb-3">
              Condomínio: <span className="font-medium text-slate-700">{condominios.find((c) => c.id === selectedId)?.nome}</span>
            </p>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setShowFormGestor(true); setShowFormSindico(false); setError(''); }}
                className="btn-primary text-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Gestor
              </button>
              <button
                onClick={() => { setShowFormSindico(true); setShowFormGestor(false); setError(''); }}
                className="btn-secondary text-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Síndico
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                <UserCog className="w-4 h-4" /> Gestores
              </p>
              {gestores.length === 0 ? (
                <p className="text-sm text-slate-400 pl-5">Nenhum gestor cadastrado.</p>
              ) : (
                gestores.map((g) => (
                  <div key={g.id} className="flex items-center justify-between text-sm border-b border-slate-100 py-2 pl-5">
                    <span className="text-slate-700">{g.nome} — {g.email}</span>
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="p-2 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors"
                        onClick={() => startEditUser('GESTOR', g)}
                        title="Editar"
                        aria-label="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => setDeletingUser({ tipo: 'GESTOR', user: g })}
                        title="Remover"
                        aria-label="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                ))
              )}
              <p className="text-sm font-medium text-slate-600 mt-3 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Síndicos
              </p>
              {sindicos.length === 0 ? (
                <p className="text-sm text-slate-400 pl-5">Nenhum síndico cadastrado.</p>
              ) : (
                sindicos.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm border-b border-slate-100 py-2 pl-5">
                    <span className="text-slate-700">{s.nome} — {s.email}</span>
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="p-2 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors"
                        onClick={() => startEditUser('SINDICO', s)}
                        title="Editar"
                        aria-label="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => setDeletingUser({ tipo: 'SINDICO', user: s })}
                        title="Remover"
                        aria-label="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </motion.div>
        )}
      </div>

      <FormModal
        open={showFormGestor}
        onClose={() => setShowFormGestor(false)}
        title="Novo gestor"
        icon={<UserCog className="w-5 h-5 text-sigac-accent" />}
      >
        <form onSubmit={handleCreateGestor} className="space-y-3">
          <input className="input" placeholder="Nome" value={formUser.nome} onChange={(e) => setFormUser((f) => ({ ...f, nome: e.target.value }))} required />
          <input type="email" className="input" placeholder="E-mail" value={formUser.email} onChange={(e) => setFormUser((f) => ({ ...f, email: e.target.value }))} required />
          <input type="password" className="input" placeholder="Senha" value={formUser.password} onChange={(e) => setFormUser((f) => ({ ...f, password: e.target.value }))} required />
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary" disabled={submitting}>Criar gestor</button>
            <button type="button" className="btn-secondary" onClick={() => setShowFormGestor(false)}>Cancelar</button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={showFormSindico}
        onClose={() => setShowFormSindico(false)}
        title="Novo síndico"
        icon={<UserCheck className="w-5 h-5 text-sigac-accent" />}
      >
        <form onSubmit={handleCreateSindico} className="space-y-3">
          <input className="input" placeholder="Nome" value={formUser.nome} onChange={(e) => setFormUser((f) => ({ ...f, nome: e.target.value }))} required />
          <input type="email" className="input" placeholder="E-mail" value={formUser.email} onChange={(e) => setFormUser((f) => ({ ...f, email: e.target.value }))} required />
          <input type="password" className="input" placeholder="Senha" value={formUser.password} onChange={(e) => setFormUser((f) => ({ ...f, password: e.target.value }))} required />
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary" disabled={submitting}>Criar síndico</button>
            <button type="button" className="btn-secondary" onClick={() => setShowFormSindico(false)}>Cancelar</button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Editar ${editing.tipo === 'GESTOR' ? 'gestor' : 'síndico'}` : ''}
        icon={<Pencil className="w-5 h-5 text-sigac-accent" />}
      >
        {editing && (
          <form onSubmit={handleUpdateUser} className="space-y-3">
            <input className="input" placeholder="Nome" value={editForm.nome} onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))} required />
            <input type="email" className="input" placeholder="E-mail" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} required />
            <div>
              <label className="text-sm text-slate-600 block mb-1">Nova senha (opcional)</label>
              <input type="text" className="input" placeholder="Deixe em branco para não alterar" value={editForm.novaSenha} onChange={(e) => setEditForm((f) => ({ ...f, novaSenha: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar alterações'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </form>
        )}
      </FormModal>

      <ConfirmModal
        open={deletingUser !== null}
        onClose={() => setDeletingUser(null)}
        onConfirm={async () => { if (deletingUser) await handleDeleteUser(deletingUser.tipo, deletingUser.user); }}
        title={deletingUser ? `Remover ${deletingUser.tipo === 'GESTOR' ? 'gestor' : 'síndico'}?` : ''}
        description={
          deletingUser
            ? `${deletingUser.user.nome} (${deletingUser.user.email}) será removido do condomínio. Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Sim, remover"
        cancelLabel="Cancelar"
        variant="danger"
        loading={submitting}
        loadingLabel="Removendo..."
      />
    </motion.div>
  );
}
