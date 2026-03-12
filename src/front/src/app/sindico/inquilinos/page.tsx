'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, InquilinoDTO } from '@/lib/api';

export default function SindicoInquilinosPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [list, setList] = useState<InquilinoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!condominioId) return;
    api<InquilinoDTO[]>(`/condominios/${condominioId}/inquilinos`).then(setList).finally(() => setLoading(false));
  }, [condominioId]);

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-teal-800 mb-6">Inquilinos (visualização)</h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="text-left p-3 text-slate-800">Nome</th>
              <th className="text-left p-3 text-slate-800">E-mail</th>
            </tr>
          </thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.id} className="border-b border-gray-100">
                <td className="p-3">{i.nome}</td>
                <td className="p-3">{i.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-gray-500 text-center">Nenhum inquilino.</p>}
      </div>
    </div>
  );
}
