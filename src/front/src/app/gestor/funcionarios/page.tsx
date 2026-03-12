'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, FuncionarioDTO } from '@/lib/api';

export default function FuncionariosPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [list, setList] = useState<FuncionarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', funcao: 'Porteiro', funcaoOutro: '', valorMensal: '' });
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    if (!condominioId) return;
    api<FuncionarioDTO[]>(`/condominios/${condominioId}/funcionarios`).then(setList).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [condominioId]);

  const funcaoEnviar = form.funcao === 'Outro' ? (form.funcaoOutro?.trim() || 'Outro') : form.funcao;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId) return;
    if (form.funcao === 'Outro' && !form.funcaoOutro?.trim()) {
      setError('Informe a função quando selecionar "Outro".');
      return;
    }
    setError('');
    try {
      const payload = { nome: form.nome, funcao: funcaoEnviar, valorMensal: Number(form.valorMensal), condominioId: Number(condominioId) };
      if (editingId) {
        await api(`/condominios/${condominioId}/funcionarios/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setEditingId(null);
      } else {
        await api(`/condominios/${condominioId}/funcionarios`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setForm({ nome: '', funcao: 'Porteiro', funcaoOutro: '', valorMensal: '' });
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
      await api(`/condominios/${condominioId}/funcionarios/${id}`, { method: 'DELETE' });
      setDeletingId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const funcoes = ['Porteiro', 'Zelador', 'Eletricista', 'Pedreiro', 'Outro'];

  const isOutro = form.funcao === 'Outro';
  const aoAbrirForm = (f?: FuncionarioDTO) => {
    const funcao = f?.funcao ?? 'Porteiro';
    const ehOutro = funcoes.indexOf(funcao) < 0;
    setForm({
      nome: f?.nome ?? '',
      funcao: ehOutro ? 'Outro' : funcao,
      funcaoOutro: ehOutro ? funcao : '',
      valorMensal: f != null ? String(f.valorMensal) : '',
    });
    setEditingId(f?.id ?? null);
    setShowForm(true);
  };

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-teal-800">Funcionários</h1>
        <button onClick={() => aoAbrirForm()} className="btn-primary">
          Novo funcionário
        </button>
      </div>
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
            <input className="input" placeholder="Nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
            <select className="input" value={form.funcao} onChange={(e) => setForm((prev) => ({ ...prev, funcao: e.target.value, funcaoOutro: e.target.value === 'Outro' ? prev.funcaoOutro : '' }))}>
              {funcoes.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            {isOutro && (
              <input
                className="input"
                placeholder="Qual a função? (ex.: Pintor, Encanador)"
                value={form.funcaoOutro}
                onChange={(e) => setForm((f) => ({ ...f, funcaoOutro: e.target.value }))}
              />
            )}
            <input type="number" step="0.01" min="0" className="input" placeholder="Valor mensal (R$)" value={form.valorMensal} onChange={(e) => setForm((f) => ({ ...f, valorMensal: e.target.value }))} required />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">{editingId ? 'Salvar' : 'Cadastrar'}</button>
              <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); setForm({ nome: '', funcao: 'Porteiro', funcaoOutro: '', valorMensal: '' }); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-teal-50 border-b border-teal-100">
            <tr>
              <th className="text-left p-3 text-teal-800">Nome</th>
              <th className="text-left p-3 text-teal-800">Função</th>
              <th className="text-right p-3 text-teal-800">Valor mensal</th>
              <th className="w-40"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">{f.nome}</td>
                <td className="p-3">{f.funcao}</td>
                <td className="p-3 text-right">R$ {Number(f.valorMensal).toFixed(2).replace('.', ',')}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button type="button" className="text-sigac-accent text-sm hover:underline" onClick={() => aoAbrirForm(f)}>Editar</button>
                    <button type="button" className="text-red-600 text-sm hover:underline" onClick={() => setDeletingId(f.id)}>Deletar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-gray-500 text-center">Nenhum funcionário cadastrado.</p>}
      </div>
      {deletingId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <p className="text-slate-800 font-medium mb-4">Excluir este funcionário? Esta ação não pode ser desfeita.</p>
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
