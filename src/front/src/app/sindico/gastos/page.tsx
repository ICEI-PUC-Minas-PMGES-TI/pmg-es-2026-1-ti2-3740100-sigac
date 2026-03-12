'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, GastoProdutoDTO } from '@/lib/api';

export default function SindicoGastosPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [list, setList] = useState<GastoProdutoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!condominioId) return;
    api<GastoProdutoDTO[]>(`/condominios/${condominioId}/gastos-produto`).then(setList).finally(() => setLoading(false));
  }, [condominioId]);

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-teal-800 mb-6">Gastos com produtos (visualização)</h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="text-left p-3 text-slate-800">Data</th>
              <th className="text-left p-3 text-slate-800">Descrição</th>
              <th className="text-left p-3 text-slate-800">Loja</th>
              <th className="text-right p-3 text-slate-800">Valor</th>
            </tr>
          </thead>
          <tbody>
            {list.map((g) => (
              <tr key={g.id} className="border-b border-gray-100">
                <td className="p-3">{new Date(g.data).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">{g.descricao}</td>
                <td className="p-3">{g.lojaFornecedor ?? '-'}</td>
                <td className="p-3 text-right">R$ {Number(g.valor).toFixed(2).replace('.', ',')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-gray-500 text-center">Nenhum gasto.</p>}
      </div>
    </div>
  );
}
