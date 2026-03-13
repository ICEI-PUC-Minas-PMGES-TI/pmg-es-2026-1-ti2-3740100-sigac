'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ManutencaoDTO } from '@/lib/api';
import { IconEdit, IconTrash } from '@/components/Icons';

export default function ManutencoesPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [list, setList] = useState<ManutencaoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().slice(0, 10),
    tipo: 'PREVISTA' as 'PREVISTA' | 'EMERGENCIAL',
    prestador: '',
    instrucoesEmail: '',
  });
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<ManutencaoDTO | null>(null);
  const [editForm, setEditForm] = useState({
    descricao: '',
    valor: '',
    data: '',
    tipo: 'PREVISTA' as 'PREVISTA' | 'EMERGENCIAL',
    prestador: '',
    instrucoesEmail: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingManutencao, setDeletingManutencao] = useState<ManutencaoDTO | null>(null);

  const load = () => {
    if (!condominioId) return;
    api<ManutencaoDTO[]>(`/condominios/${condominioId}/manutencoes`).then(setList).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [condominioId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId) return;
    setError('');
    try {
      await api(`/condominios/${condominioId}/manutencoes`, {
        method: 'POST',
        body: JSON.stringify({
          descricao: form.descricao,
          valor: Number(form.valor),
          data: form.data,
          tipo: form.tipo,
          prestador: form.prestador || undefined,
          instrucoesEmail: form.instrucoesEmail || undefined,
          condominioId: Number(condominioId),
        }),
      });
      setForm({ descricao: '', valor: '', data: new Date().toISOString().slice(0, 10), tipo: 'PREVISTA', prestador: '', instrucoesEmail: '' });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro');
    }
  };

  const startEdit = (m: ManutencaoDTO) => {
    setEditing(m);
    setEditForm({
      descricao: m.descricao,
      valor: String(m.valor),
      data: m.data.slice(0, 10),
      tipo: m.tipo,
      prestador: m.prestador ?? '',
      instrucoesEmail: m.instrucoesEmail ?? '',
    });
    setError('');
  };

  const handleUpdate = async (notificar: boolean) => {
    if (!condominioId || !editing) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${condominioId}/manutencoes/${editing.id}?notificar=${notificar}`, {
        method: 'PUT',
        body: JSON.stringify({
          descricao: editForm.descricao,
          valor: Number(editForm.valor),
          data: editForm.data,
          tipo: editForm.tipo,
          prestador: editForm.prestador || undefined,
          instrucoesEmail: editForm.instrucoesEmail || undefined,
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

  const handleDelete = async (m: ManutencaoDTO) => {
    if (!condominioId) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${condominioId}/manutencoes/${m.id}`, { method: 'DELETE' });
      if (editing?.id === m.id) setEditing(null);
      setDeletingManutencao(null);
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
        <h1 className="text-2xl font-bold text-teal-800">Manutenções</h1>
        <p className="text-sm text-gray-500">Ao cadastrar, os inquilinos recebem e-mail com a programação.</p>
        <button onClick={() => { setShowForm(true); setError(''); }} className="btn-primary">
          Nova manutenção
        </button>
      </div>
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
            <input className="input" placeholder="Descrição (ex: manutenção no portão)" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} required />
            <input type="number" step="0.01" min="0" className="input" placeholder="Valor (R$)" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} required />
            <input type="date" className="input" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} required />
            <select className="input" value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as 'PREVISTA' | 'EMERGENCIAL' }))}>
              <option value="PREVISTA">Prevista</option>
              <option value="EMERGENCIAL">Emergencial</option>
            </select>
            <input className="input" placeholder="Prestador (ex: Joãozin)" value={form.prestador} onChange={(e) => setForm((f) => ({ ...f, prestador: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Instruções ou dica para o e-mail
              </label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Ex.: Fique atento(a) às orientações (portão em modo manual - levar chave). Este texto aparecerá no e-mail enviado aos inquilinos."
                value={form.instrucoesEmail}
                onChange={(e) => setForm((f) => ({ ...f, instrucoesEmail: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Cadastrar e notificar inquilinos</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {editing && (
        <div className="card mb-6">
          <h2 className="font-semibold text-teal-800 mb-3">Editar manutenção</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdate(false); }} className="space-y-3 max-w-md">
            <input className="input" placeholder="Descrição" value={editForm.descricao} onChange={(e) => setEditForm((f) => ({ ...f, descricao: e.target.value }))} required />
            <input type="number" step="0.01" min="0" className="input" placeholder="Valor (R$)" value={editForm.valor} onChange={(e) => setEditForm((f) => ({ ...f, valor: e.target.value }))} required />
            <input type="date" className="input" value={editForm.data} onChange={(e) => setEditForm((f) => ({ ...f, data: e.target.value }))} required />
            <select className="input" value={editForm.tipo} onChange={(e) => setEditForm((f) => ({ ...f, tipo: e.target.value as 'PREVISTA' | 'EMERGENCIAL' }))}>
              <option value="PREVISTA">Prevista</option>
              <option value="EMERGENCIAL">Emergencial</option>
            </select>
            <input className="input" placeholder="Prestador" value={editForm.prestador} onChange={(e) => setEditForm((f) => ({ ...f, prestador: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instruções ou dica para o e-mail</label>
              <textarea className="input min-h-[80px]" placeholder="Texto que aparece no e-mail aos inquilinos" value={editForm.instrucoesEmail} onChange={(e) => setEditForm((f) => ({ ...f, instrucoesEmail: e.target.value }))} rows={3} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
              <button type="button" className="btn-secondary" disabled={submitting} onClick={() => handleUpdate(true)}>
                Salvar e notificar inquilinos
              </button>
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
              <th className="text-left p-3 text-teal-800">Tipo</th>
              <th className="text-left p-3 text-teal-800">Prestador</th>
              <th className="text-right p-3 text-teal-800">Valor</th>
              <th className="text-right p-3 text-teal-800">Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">{new Date(m.data).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">{m.descricao}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-sm ${m.tipo === 'EMERGENCIAL' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>{m.tipo === 'EMERGENCIAL' ? 'Emergencial' : 'Prevista'}</span></td>
                <td className="p-3">{m.prestador ?? '-'}</td>
                <td className="p-3 text-right">R$ {Number(m.valor).toFixed(2).replace('.', ',')}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" className="p-2 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors" onClick={() => startEdit(m)} title="Editar" aria-label="Editar">
                      <IconEdit className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors" onClick={() => setDeletingManutencao(m)} title="Excluir" aria-label="Excluir">
                      <IconTrash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-gray-500 text-center">Nenhuma manutenção cadastrada.</p>}
      </div>

      {deletingManutencao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <p className="text-slate-800 font-medium mb-4">Excluir esta manutenção? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setDeletingManutencao(null)}>Cancelar</button>
              <button type="button" className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg" disabled={submitting} onClick={() => handleDelete(deletingManutencao)}>
                {submitting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
