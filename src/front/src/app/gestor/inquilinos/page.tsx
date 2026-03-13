'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Pencil, Trash2, Users } from 'lucide-react';
import { api, InquilinoDTO } from '@/lib/api';
import { TableSkeleton } from '@/components/LoadingSpinner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { FormModal } from '@/components/FormModal';

export default function InquilinosPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [list, setList] = useState<InquilinoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '' });
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!condominioId) return;
    api<InquilinoDTO[]>(`/condominios/${condominioId}/inquilinos`).then(setList).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [condominioId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId) return;
    setError('');
    try {
      if (editingId) {
        await api(`/condominios/${condominioId}/inquilinos/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ ...form, condominioId: Number(condominioId) }),
        });
        setEditingId(null);
      } else {
        await api(`/condominios/${condominioId}/inquilinos`, {
          method: 'POST',
          body: JSON.stringify({ ...form, condominioId: Number(condominioId) }),
        });
      }
      setForm({ nome: '', email: '' });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleDelete = async (id: number) => {
    if (!condominioId) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${condominioId}/inquilinos/${id}`, { method: 'DELETE' });
      setDeletingId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    } finally {
      setSubmitting(false);
    }
  };

  const deletingItem = list.find((i) => i.id === deletingId);

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <TableSkeleton rows={6} />;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sigac-nav flex items-center gap-2">
            <Users className="w-8 h-8 text-sigac-accent" />
            Inquilinos
          </h1>
          <p className="text-sm text-slate-500 mt-1">E-mails recebem notificações de manutenção.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ nome: '', email: '' }); }}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Novo inquilino
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="toast-error">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <FormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingId(null); }}
        title={editingId ? 'Editar inquilino' : 'Novo inquilino'}
        icon={<UserPlus className="w-5 h-5 text-sigac-accent" />}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="input" placeholder="Nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
          <input type="email" className="input" placeholder="E-mail" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary">{editingId ? 'Salvar' : 'Cadastrar'}</button>
            <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</button>
          </div>
        </form>
      </FormModal>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card overflow-hidden p-0 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-sigac-accent/10 to-sigac-accent/5 text-sigac-nav border-b border-slate-200">
                <th className="text-left p-3 font-semibold rounded-tl-2xl">Nome</th>
                <th className="text-left p-3 font-semibold">E-mail</th>
                <th className="w-28 p-3 font-semibold rounded-tr-2xl text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((i, idx) => (
                <motion.tr
                  key={i.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * idx }}
                  className={`border-b border-slate-100 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-sigac-accent/5`}
                >
                  <td className="p-3 font-medium text-slate-800">{i.nome}</td>
                  <td className="p-3 text-slate-600">{i.email}</td>
                  <td className="p-2">
                    <div className="flex items-center justify-end gap-1">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="p-2 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors" onClick={() => { setForm({ nome: i.nome, email: i.email }); setEditingId(i.id); setShowForm(true); }} title="Editar" aria-label="Editar">
                        <Pencil className="w-5 h-5" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors" onClick={() => setDeletingId(i.id)} title="Remover" aria-label="Remover">
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && (
          <p className="p-8 text-slate-500 text-center">
            Nenhum inquilino cadastrado. Clique em <strong>Novo inquilino</strong> para começar.
          </p>
        )}
      </motion.div>

      <ConfirmModal
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => { if (deletingId !== null) await handleDelete(deletingId); }}
        title="Excluir inquilino?"
        description={deletingItem ? `"${deletingItem.nome}" (${deletingItem.email}) deixará de receber notificações de manutenção. O registro será removido. Deseja continuar?` : ''}
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={submitting}
        loadingLabel="Excluindo..."
      />
    </motion.div>
  );
}
