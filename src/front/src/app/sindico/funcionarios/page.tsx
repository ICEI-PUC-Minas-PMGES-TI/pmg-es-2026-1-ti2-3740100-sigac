'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, FuncionarioDTO } from '@/lib/api';

export default function SindicoFuncionariosPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [list, setList] = useState<FuncionarioDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!condominioId) return;
    api<FuncionarioDTO[]>(`/condominios/${condominioId}/funcionarios`).then(setList).finally(() => setLoading(false));
  }, [condominioId]);

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-teal-800 mb-6">Funcionários (visualização)</h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="text-left p-3 text-slate-800">Nome</th>
              <th className="text-left p-3 text-slate-800">Função</th>
              <th className="text-right p-3 text-slate-800">Valor mensal</th>
            </tr>
          </thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id} className="border-b border-gray-100">
                <td className="p-3">{f.nome}</td>
                <td className="p-3">{f.funcao}</td>
                <td className="p-3 text-right">R$ {Number(f.valorMensal).toFixed(2).replace('.', ',')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-gray-500 text-center">Nenhum funcionário.</p>}
      </div>
    </div>
  );
}
