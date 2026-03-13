'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Pencil, Trash2, Plus } from 'lucide-react';
import { api, GastoProdutoDTO } from '@/lib/api';
import { TableSkeleton } from '@/components/LoadingSpinner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { FormModal } from '@/components/FormModal';

export default function GastosPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [list, setList] = useState<GastoProdutoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ descricao: '', valor: '', data: new Date().toISOString().slice(0, 10), lojaFornecedor: '' });
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<GastoProdutoDTO | null>(null);
  const [editForm, setEditForm] = useState({ descricao: '', valor: '', data: '', lojaFornecedor: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deletingGasto, setDeletingGasto] = useState<GastoProdutoDTO | null>(null);

  const load = () => {
    if (!condominioId) return;
    api<GastoProdutoDTO[]>(`/condominios/${condominioId}/gastos-produto`).then(setList).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [condominioId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId) return;
    setError('');
    try {
      await api(`/condominios/${condominioId}/gastos-produto`, {
        method: 'POST',
        body: JSON.stringify({
          descricao: form.descricao || undefined,
          valor: Number(form.valor),
          data: form.data,
          lojaFornecedor: form.lojaFornecedor || undefined,
          condominioId: Number(condominioId),
        }),
      });
      setForm({ descricao: '', valor: '', data: new Date().toISOString().slice(0, 10), lojaFornecedor: '' });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro');
    }
  };

  const startEdit = (g: GastoProdutoDTO) => {
    setEditing(g);
    setEditForm({
      descricao: g.descricao ?? '',
      valor: String(g.valor),
      data: g.data.slice(0, 10),
      lojaFornecedor: g.lojaFornecedor ?? '',
    });
    setError('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId || !editing) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${condominioId}/gastos-produto/${editing.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          descricao: editForm.descricao || undefined,
          valor: Number(editForm.valor),
          data: editForm.data,
          lojaFornecedor: editForm.lojaFornecedor || undefined,
          condominioId: Number(condominioId),
        }),
      });
      setEditing(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (g: GastoProdutoDTO) => {
    if (!condominioId) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${condominioId}/gastos-produto/${g.id}`, { method: 'DELETE' });
      if (editing?.id === g.id) setEditing(null);
      setDeletingGasto(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    } finally {
      setSubmitting(false);
    }
  };

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <TableSkeleton rows={6} />;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-sigac-nav flex items-center gap-2">
          <Receipt className="w-8 h-8 text-sigac-accent" />
          Gastos com produtos
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setShowForm(true); setError(''); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Registrar gasto
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
        onClose={() => setShowForm(false)}
        title="Registrar gasto"
        icon={<Receipt className="w-5 h-5 text-sigac-accent" />}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="input" placeholder="Descrição (opcional, ex: cloro para piscina)" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
          <input type="number" step="0.01" min="0" className="input" placeholder="Valor (R$)" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} required />
          <input type="date" className="input" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} required />
          <input className="input" placeholder="Loja/fornecedor" value={form.lojaFornecedor} onChange={(e) => setForm((f) => ({ ...f, lojaFornecedor: e.target.value }))} />
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary">Registrar</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Editar gasto"
        icon={<Pencil className="w-5 h-5 text-sigac-accent" />}
      >
        {editing && (
          <form onSubmit={handleUpdate} className="space-y-3">
            <input className="input" placeholder="Descrição (opcional)" value={editForm.descricao} onChange={(e) => setEditForm((f) => ({ ...f, descricao: e.target.value }))} />
            <input type="number" step="0.01" min="0" className="input" placeholder="Valor (R$)" value={editForm.valor} onChange={(e) => setEditForm((f) => ({ ...f, valor: e.target.value }))} required />
            <input type="date" className="input" value={editForm.data} onChange={(e) => setEditForm((f) => ({ ...f, data: e.target.value }))} required />
            <input className="input" placeholder="Loja/fornecedor" value={editForm.lojaFornecedor} onChange={(e) => setEditForm((f) => ({ ...f, lojaFornecedor: e.target.value }))} />
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </form>
        )}
      </FormModal>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card overflow-hidden p-0 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-sigac-accent/10 to-sigac-accent/5 text-sigac-nav border-b border-slate-200">
                <th className="text-left p-3 font-semibold rounded-tl-2xl">Data</th>
                <th className="text-left p-3 font-semibold">Descrição</th>
                <th className="text-left p-3 font-semibold">Loja</th>
                <th className="text-right p-3 font-semibold">Valor</th>
                <th className="w-28 p-3 font-semibold rounded-tr-2xl text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((g, i) => (
                <motion.tr
                  key={g.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * i }}
                  className={`border-b border-slate-100 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-sigac-accent/5`}
                >
                  <td className="p-3 text-slate-700">{new Date(g.data).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 text-slate-600">{g.descricao ?? '—'}</td>
                  <td className="p-3 text-slate-600">{g.lojaFornecedor ?? '—'}</td>
                  <td className="p-3 text-right font-medium text-sigac-nav">R$ {Number(g.valor).toFixed(2).replace('.', ',')}</td>
                  <td className="p-2">
                    <div className="flex items-center justify-end gap-1">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="p-2 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors" onClick={() => startEdit(g)} title="Editar" aria-label="Editar">
                        <Pencil className="w-5 h-5" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors" onClick={() => setDeletingGasto(g)} title="Excluir" aria-label="Excluir">
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
            Nenhum gasto registrado. Clique em <strong>Registrar gasto</strong> para começar.
          </p>
        )}
      </motion.div>

      <ConfirmModal
        open={deletingGasto !== null}
        onClose={() => setDeletingGasto(null)}
        onConfirm={async () => { if (deletingGasto) await handleDelete(deletingGasto); }}
        title="Excluir este gasto?"
        description={deletingGasto ? `O lançamento de ${new Date(deletingGasto.data).toLocaleDateString('pt-BR')} (R$ ${Number(deletingGasto.valor).toFixed(2).replace('.', ',')}) será removido. Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={submitting}
        loadingLabel="Excluindo..."
      />
    </motion.div>
  );
}
