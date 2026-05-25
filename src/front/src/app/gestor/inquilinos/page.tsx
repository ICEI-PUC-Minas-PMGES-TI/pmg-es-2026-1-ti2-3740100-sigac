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
  const [inquilinos, setInquilinos] = useState<InquilinoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [inquilinoForm, setInquilinoForm] = useState({ nome: '', email: '' });
  const [error, setError] = useState('');
  const [editingInquilinoId, setEditingInquilinoId] = useState<number | null>(null);
  const [deletingInquilinoId, setDeletingInquilinoId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const carregarInquilinos = () => {
    if (!condominioId) return;
    api<InquilinoDTO[]>(`/condominios/${condominioId}/inquilinos`)
      .then(setInquilinos)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarInquilinos();
  }, [condominioId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId) return;
    setError('');
    try {
      if (editingInquilinoId) {
        await api(`/condominios/${condominioId}/inquilinos/${editingInquilinoId}`, {
          method: 'PUT',
          body: JSON.stringify({ ...inquilinoForm, condominioId: Number(condominioId) }),
        });
        setEditingInquilinoId(null);
      } else {
        await api(`/condominios/${condominioId}/inquilinos`, {
          method: 'POST',
          body: JSON.stringify({ ...inquilinoForm, condominioId: Number(condominioId) }),
        });
      }
      setInquilinoForm({ nome: '', email: '' });
      setShowForm(false);
      carregarInquilinos();
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
      setDeletingInquilinoId(null);
      carregarInquilinos();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    } finally {
      setSubmitting(false);
    }
  };

  const deletingInquilino = inquilinos.find((inquilino) => inquilino.id === deletingInquilinoId);

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
          onClick={() => {
            setShowForm(true);
            setEditingInquilinoId(null);
            setInquilinoForm({ nome: '', email: '' });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Novo inquilino
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
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingInquilinoId(null);
        }}
        title={editingInquilinoId ? 'Editar inquilino' : 'Novo inquilino'}
        icon={<UserPlus className="w-5 h-5 text-sigac-accent" />}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="input"
            placeholder="Nome"
            value={inquilinoForm.nome}
            onChange={(e) => setInquilinoForm((currentForm) => ({ ...currentForm, nome: e.target.value }))}
            required
          />
          <input
            type="email"
            className="input"
            placeholder="E-mail"
            value={inquilinoForm.email}
            onChange={(e) => setInquilinoForm((currentForm) => ({ ...currentForm, email: e.target.value }))}
            required
          />
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary">
              {editingInquilinoId ? 'Salvar' : 'Cadastrar'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditingInquilinoId(null);
              }}
            >
              Cancelar
            </button>
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
              {inquilinos.map((inquilino, index) => (
                <motion.tr
                  key={inquilino.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * index }}
                  className={`border-b border-slate-100 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  } hover:bg-sigac-accent/5`}
                >
                  <td className="p-3 font-medium text-slate-800">{inquilino.nome}</td>
                  <td className="p-3 text-slate-600">{inquilino.email}</td>
                  <td className="p-2">
                    <div className="flex items-center justify-end gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="p-2 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors"
                        onClick={() => {
                          setInquilinoForm({ nome: inquilino.nome, email: inquilino.email });
                          setEditingInquilinoId(inquilino.id);
                          setShowForm(true);
                        }}
                        title="Editar"
                        aria-label="Editar"
                      >
                        <Pencil className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => setDeletingInquilinoId(inquilino.id)}
                        title="Remover"
                        aria-label="Remover"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {inquilinos.length === 0 && (
          <p className="p-8 text-slate-500 text-center">
            Nenhum inquilino cadastrado. Clique em <strong>Novo inquilino</strong> para começar.
          </p>
        )}
      </motion.div>

      <ConfirmModal
        open={deletingInquilinoId !== null}
        onClose={() => setDeletingInquilinoId(null)}
        onConfirm={async () => {
          if (deletingInquilinoId !== null) await handleDelete(deletingInquilinoId);
        }}
        title="Excluir inquilino?"
        description={
          deletingInquilino
            ? `"${deletingInquilino.nome}" (${deletingInquilino.email}) deixará de receber notificações de manutenção. O registro será removido. Deseja continuar?`
            : ''
        }
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={submitting}
        loadingLabel="Excluindo..."
      />
    </motion.div>
  );
}
