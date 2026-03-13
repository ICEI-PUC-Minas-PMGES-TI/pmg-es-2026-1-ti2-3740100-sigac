'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, GastoProdutoDTO } from '@/lib/api';
import { IconEdit, IconTrash } from '@/components/Icons';

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
  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-teal-800">Gastos com produtos</h1>
        <button onClick={() => { setShowForm(true); setError(''); }} className="btn-primary">
          Registrar gasto
        </button>
      </div>
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
            <input className="input" placeholder="Descrição (opcional, ex: cloro para piscina)" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
            <input type="number" step="0.01" min="0" className="input" placeholder="Valor (R$)" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} required />
            <input type="date" className="input" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} required />
            <input className="input" placeholder="Loja/fornecedor" value={form.lojaFornecedor} onChange={(e) => setForm((f) => ({ ...f, lojaFornecedor: e.target.value }))} />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Registrar</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      {editing && (
        <div className="card mb-6">
          <h2 className="font-semibold text-teal-800 mb-3">Editar gasto</h2>
          <form onSubmit={handleUpdate} className="space-y-3 max-w-md">
            <input className="input" placeholder="Descrição (opcional)" value={editForm.descricao} onChange={(e) => setEditForm((f) => ({ ...f, descricao: e.target.value }))} />
            <input type="number" step="0.01" min="0" className="input" placeholder="Valor (R$)" value={editForm.valor} onChange={(e) => setEditForm((f) => ({ ...f, valor: e.target.value }))} required />
            <input type="date" className="input" value={editForm.data} onChange={(e) => setEditForm((f) => ({ ...f, data: e.target.value }))} required />
            <input className="input" placeholder="Loja/fornecedor" value={editForm.lojaFornecedor} onChange={(e) => setEditForm((f) => ({ ...f, lojaFornecedor: e.target.value }))} />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-teal-50 border-b border-teal-100">
            <tr>
              <th className="text-left p-3 text-teal-800">Data</th>
              <th className="text-left p-3 text-teal-800">Descrição</th>
              <th className="text-left p-3 text-teal-800">Loja</th>
              <th className="text-right p-3 text-teal-800">Valor</th>
              <th className="text-right p-3 text-teal-800">Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map((g) => (
              <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">{new Date(g.data).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">{g.descricao ?? '-'}</td>
                <td className="p-3">{g.lojaFornecedor ?? '-'}</td>
                <td className="p-3 text-right">R$ {Number(g.valor).toFixed(2).replace('.', ',')}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" className="p-2 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors" onClick={() => startEdit(g)} title="Editar" aria-label="Editar">
                      <IconEdit className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors" onClick={() => setDeletingGasto(g)} title="Excluir" aria-label="Excluir">
                      <IconTrash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-gray-500 text-center">Nenhum gasto com produto registrado.</p>}
      </div>

      {deletingGasto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <p className="text-slate-800 font-medium mb-4">Excluir este gasto? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setDeletingGasto(null)}>Cancelar</button>
              <button type="button" className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg" disabled={submitting} onClick={() => handleDelete(deletingGasto)}>
                {submitting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
