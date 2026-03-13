'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, InquilinoDTO } from '@/lib/api';
import { IconEdit, IconTrash } from '@/components/Icons';

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
    try {
      await api(`/condominios/${condominioId}/inquilinos/${id}`, { method: 'DELETE' });
      setDeletingId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-teal-800">Inquilinos</h1>
        <p className="text-sm text-gray-500">E-mails recebem notificações de manutenção.</p>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ nome: '', email: '' }); }} className="btn-primary">
          Novo inquilino
        </button>
      </div>
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
            <input className="input" placeholder="Nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
            <input type="email" className="input" placeholder="E-mail" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">{editingId ? 'Salvar' : 'Cadastrar'}</button>
              <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-teal-50 border-b border-teal-100">
            <tr>
              <th className="text-left p-3 text-teal-800">Nome</th>
              <th className="text-left p-3 text-teal-800">E-mail</th>
              <th className="w-40"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">{i.nome}</td>
                <td className="p-3">{i.email}</td>
                <td className="p-2">
                  <div className="flex items-center gap-1">
                    <button type="button" className="p-2 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors" onClick={() => { setForm({ nome: i.nome, email: i.email }); setEditingId(i.id); setShowForm(true); }} title="Editar" aria-label="Editar">
                      <IconEdit className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors" onClick={() => setDeletingId(i.id)} title="Remover" aria-label="Remover">
                      <IconTrash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-gray-500 text-center">Nenhum inquilino cadastrado.</p>}
      </div>
      {deletingId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <p className="text-slate-800 font-medium mb-4">Excluir este inquilino? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setDeletingId(null)}>Cancelar</button>
              <button type="button" className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg" onClick={() => handleDelete(deletingId)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
