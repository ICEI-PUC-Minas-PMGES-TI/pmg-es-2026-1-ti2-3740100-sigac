'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ManutencaoDTO } from '@/lib/api';

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
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-teal-50 border-b border-teal-100">
            <tr>
              <th className="text-left p-3 text-teal-800">Data</th>
              <th className="text-left p-3 text-teal-800">Descrição</th>
              <th className="text-left p-3 text-teal-800">Tipo</th>
              <th className="text-left p-3 text-teal-800">Prestador</th>
              <th className="text-right p-3 text-teal-800">Valor</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">{new Date(m.data).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">{m.descricao}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-sm ${m.tipo === 'EMERGENCIAL' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>{m.tipo}</span></td>
                <td className="p-3">{m.prestador ?? '-'}</td>
                <td className="p-3 text-right">R$ {Number(m.valor).toFixed(2).replace('.', ',')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-gray-500 text-center">Nenhuma manutenção cadastrada.</p>}
      </div>
    </div>
  );
}
