'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Pencil, Trash2, Plus } from 'lucide-react';
import { api, GastoProdutoDTO } from '@/lib/api';
import { TableSkeleton } from '@/components/LoadingSpinner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { FormModal } from '@/components/FormModal';

function monthNamePtBr(mes: number) {
  return new Date(2000, mes - 1, 1).toLocaleString('pt-BR', { month: 'long' });
}

export default function GastosPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [gastos, setGastos] = useState<GastoProdutoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const dataAtual = useMemo(() => new Date(), []);
  const [anoFiltro, setAnoFiltro] = useState<number | 'todos'>(dataAtual.getFullYear());
  const [mesFiltro, setMesFiltro] = useState<number | 'todos'>(dataAtual.getMonth() + 1);
  const [showForm, setShowForm] = useState(false);
  const [gastoForm, setGastoForm] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().slice(0, 10),
    lojaFornecedor: '',
  });
  const [error, setError] = useState('');
  const [editingGasto, setEditingGasto] = useState<GastoProdutoDTO | null>(null);
  const [editGastoForm, setEditGastoForm] = useState({
    descricao: '',
    valor: '',
    data: '',
    lojaFornecedor: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingGasto, setDeletingGasto] = useState<GastoProdutoDTO | null>(null);

  const carregarGastos = () => {
    if (!condominioId) return;
    api<GastoProdutoDTO[]>(`/condominios/${condominioId}/gastos-produto`)
      .then(setGastos)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarGastos();
  }, [condominioId]);

  const gastosFiltrados = useMemo(() => {
    if (anoFiltro === 'todos' && mesFiltro === 'todos') return gastos;

    return gastos.filter((gasto) => {
      const dataGasto = new Date(gasto.data);
      const anoGasto = dataGasto.getFullYear();
      const mesGasto = dataGasto.getMonth() + 1;

      if (anoFiltro !== 'todos' && anoGasto !== anoFiltro) return false;
      if (mesFiltro !== 'todos' && mesGasto !== mesFiltro) return false;
      return true;
    });
  }, [gastos, anoFiltro, mesFiltro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId) return;
    setError('');
    try {
      await api(`/condominios/${condominioId}/gastos-produto`, {
        method: 'POST',
        body: JSON.stringify({
          descricao: gastoForm.descricao || undefined,
          valor: Number(gastoForm.valor),
          data: gastoForm.data,
          lojaFornecedor: gastoForm.lojaFornecedor || undefined,
          condominioId: Number(condominioId),
        }),
      });
      setGastoForm({
        descricao: '',
        valor: '',
        data: new Date().toISOString().slice(0, 10),
        lojaFornecedor: '',
      });
      setShowForm(false);
      carregarGastos();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro');
    }
  };

  const startEdit = (gasto: GastoProdutoDTO) => {
    setEditingGasto(gasto);
    setEditGastoForm({
      descricao: gasto.descricao ?? '',
      valor: String(gasto.valor),
      data: gasto.data.slice(0, 10),
      lojaFornecedor: gasto.lojaFornecedor ?? '',
    });
    setError('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId || !editingGasto) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${condominioId}/gastos-produto/${editingGasto.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          descricao: editGastoForm.descricao || undefined,
          valor: Number(editGastoForm.valor),
          data: editGastoForm.data,
          lojaFornecedor: editGastoForm.lojaFornecedor || undefined,
          condominioId: Number(condominioId),
        }),
      });
      setEditingGasto(null);
      carregarGastos();
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
      if (editingGasto?.id === g.id) setEditingGasto(null);
      setDeletingGasto(null);
      carregarGastos();
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
          onClick={() => {
            setShowForm(true);
            setError('');
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Registrar gasto
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Ano</span>
          <select
            className="input w-28 bg-white/90"
            value={anoFiltro}
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'todos') {
                setAnoFiltro('todos');
                setMesFiltro('todos');
              } else {
                setAnoFiltro(Number(v));
              }
            }}
          >
            <option value="todos">Todos</option>
            {[dataAtual.getFullYear() - 1, dataAtual.getFullYear(), dataAtual.getFullYear() + 1].map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Mês</span>
          <select
            className="input w-40 bg-white/90"
            value={mesFiltro}
            onChange={(e) => setMesFiltro(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            disabled={anoFiltro === 'todos'}
            title={anoFiltro === 'todos' ? 'Selecione um ano para filtrar por mês' : undefined}
          >
            <option value="todos">Todos</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mes) => (
              <option key={mes} value={mes}>
                {monthNamePtBr(mes)}
              </option>
            ))}
          </select>
        </label>
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
        onClose={() => setShowForm(false)}
        title="Registrar gasto"
        icon={<Receipt className="w-5 h-5 text-sigac-accent" />}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="input"
            placeholder="Descrição (opcional, ex: cloro para piscina)"
            value={gastoForm.descricao}
            onChange={(e) => setGastoForm((currentForm) => ({ ...currentForm, descricao: e.target.value }))}
          />
          <input
            type="number"
            step="0.01"
            min="0"
            className="input"
            placeholder="Valor (R$)"
            value={gastoForm.valor}
            onChange={(e) => setGastoForm((currentForm) => ({ ...currentForm, valor: e.target.value }))}
            required
          />
          <input
            type="date"
            className="input"
            value={gastoForm.data}
            onChange={(e) => setGastoForm((currentForm) => ({ ...currentForm, data: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Loja/fornecedor"
            value={gastoForm.lojaFornecedor}
            onChange={(e) => setGastoForm((currentForm) => ({ ...currentForm, lojaFornecedor: e.target.value }))}
          />
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary">
              Registrar
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={editingGasto !== null}
        onClose={() => setEditingGasto(null)}
        title="Editar gasto"
        icon={<Pencil className="w-5 h-5 text-sigac-accent" />}
      >
        {editingGasto && (
          <form onSubmit={handleUpdate} className="space-y-3">
            <input
              className="input"
              placeholder="Descrição (opcional)"
              value={editGastoForm.descricao}
              onChange={(e) => setEditGastoForm((currentForm) => ({ ...currentForm, descricao: e.target.value }))}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              placeholder="Valor (R$)"
              value={editGastoForm.valor}
              onChange={(e) => setEditGastoForm((currentForm) => ({ ...currentForm, valor: e.target.value }))}
              required
            />
            <input
              type="date"
              className="input"
              value={editGastoForm.data}
              onChange={(e) => setEditGastoForm((currentForm) => ({ ...currentForm, data: e.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="Loja/fornecedor"
              value={editGastoForm.lojaFornecedor}
              onChange={(e) =>
                setEditGastoForm((currentForm) => ({ ...currentForm, lojaFornecedor: e.target.value }))
              }
            />
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEditingGasto(null)}>
                Cancelar
              </button>
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
              {gastosFiltrados.map((gasto, index) => (
                <motion.tr
                  key={gasto.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * index }}
                  className={`border-b border-slate-100 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  } hover:bg-sigac-accent/5`}
                >
                  <td className="p-3 text-slate-700">{new Date(gasto.data).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 text-slate-600">{gasto.descricao ?? '—'}</td>
                  <td className="p-3 text-slate-600">{gasto.lojaFornecedor ?? '—'}</td>
                  <td className="p-3 text-right font-medium text-sigac-nav">
                    R$ {Number(gasto.valor).toFixed(2).replace('.', ',')}
                  </td>
                  <td className="p-2">
                    <div className="flex items-center justify-end gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="p-2 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors"
                        onClick={() => startEdit(gasto)}
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
                        onClick={() => setDeletingGasto(gasto)}
                        title="Excluir"
                        aria-label="Excluir"
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
        {gastosFiltrados.length === 0 && (
          <p className="p-8 text-slate-500 text-center">
            Nenhum gasto encontrado para o filtro selecionado.
          </p>
        )}
      </motion.div>

      <ConfirmModal
        open={deletingGasto !== null}
        onClose={() => setDeletingGasto(null)}
        onConfirm={async () => {
          if (deletingGasto) await handleDelete(deletingGasto);
        }}
        title="Excluir este gasto?"
        description={
          deletingGasto
            ? `O lançamento de ${new Date(deletingGasto.data).toLocaleDateString('pt-BR')} (R$ ${Number(
                deletingGasto.valor,
              )
                .toFixed(2)
                .replace('.', ',')}) será removido. Esta ação não pode ser desfeita.`
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
