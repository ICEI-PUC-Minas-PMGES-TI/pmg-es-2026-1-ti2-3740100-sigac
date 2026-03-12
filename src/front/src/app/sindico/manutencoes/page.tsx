'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ManutencaoDTO } from '@/lib/api';

export default function SindicoManutencoesPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [list, setList] = useState<ManutencaoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!condominioId) return;
    api<ManutencaoDTO[]>(`/condominios/${condominioId}/manutencoes`).then(setList).finally(() => setLoading(false));
  }, [condominioId]);

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-teal-800 mb-6">Manutenções (visualização)</h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="text-left p-3 text-slate-800">Data</th>
              <th className="text-left p-3 text-slate-800">Descrição</th>
              <th className="text-left p-3 text-slate-800">Tipo</th>
              <th className="text-left p-3 text-slate-800">Prestador</th>
              <th className="text-right p-3 text-slate-800">Valor</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="border-b border-gray-100">
                <td className="p-3">{new Date(m.data).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">{m.descricao}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-sm ${m.tipo === 'EMERGENCIAL' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>{m.tipo}</span></td>
                <td className="p-3">{m.prestador ?? '-'}</td>
                <td className="p-3 text-right">R$ {Number(m.valor).toFixed(2).replace('.', ',')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-gray-500 text-center">Nenhuma manutenção.</p>}
      </div>
    </div>
  );
}
