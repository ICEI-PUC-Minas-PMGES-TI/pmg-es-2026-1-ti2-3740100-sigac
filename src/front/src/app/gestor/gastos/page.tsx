'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, GastoProdutoDTO } from '@/lib/api';

export default function GastosPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [list, setList] = useState<GastoProdutoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ descricao: '', valor: '', data: new Date().toISOString().slice(0, 10), lojaFornecedor: '' });
  const [error, setError] = useState('');

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
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-teal-50 border-b border-teal-100">
            <tr>
              <th className="text-left p-3 text-teal-800">Data</th>
              <th className="text-left p-3 text-teal-800">Descrição</th>
              <th className="text-left p-3 text-teal-800">Loja</th>
              <th className="text-right p-3 text-teal-800">Valor</th>
            </tr>
          </thead>
          <tbody>
            {list.map((g) => (
              <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">{new Date(g.data).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">{g.descricao ?? '-'}</td>
                <td className="p-3">{g.lojaFornecedor ?? '-'}</td>
                <td className="p-3 text-right">R$ {Number(g.valor).toFixed(2).replace('.', ',')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-gray-500 text-center">Nenhum gasto com produto registrado.</p>}
      </div>
    </div>
  );
}
