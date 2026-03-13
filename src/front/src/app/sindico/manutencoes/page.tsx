'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';
import { api, ManutencaoDTO } from '@/lib/api';
import { TableSkeleton } from '@/components/LoadingSpinner';

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
  if (loading) return <TableSkeleton rows={6} />;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-sigac-nav flex items-center gap-2">
        <Wrench className="w-8 h-8 text-sigac-accent" />
        Manutenções (visualização)
      </h1>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card overflow-hidden p-0 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-sigac-accent/10 to-sigac-accent/5 text-sigac-nav border-b border-slate-200">
                <th className="text-left p-3 font-semibold rounded-tl-2xl">Data</th>
                <th className="text-left p-3 font-semibold">Descrição</th>
                <th className="text-left p-3 font-semibold">Tipo</th>
                <th className="text-left p-3 font-semibold">Prestador</th>
                <th className="text-right p-3 font-semibold rounded-tr-2xl">Valor</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * i }}
                  className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-sigac-accent/5 transition-colors`}
                >
                  <td className="p-3 text-slate-700">{new Date(m.data).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 text-slate-600">{m.descricao}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${m.tipo === 'EMERGENCIAL' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {m.tipo === 'EMERGENCIAL' ? 'Emergencial' : 'Prevista'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{m.prestador ?? '—'}</td>
                  <td className="p-3 text-right font-medium text-sigac-nav">R$ {Number(m.valor).toFixed(2).replace('.', ',')}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="p-8 text-slate-500 text-center">Nenhuma manutenção cadastrada.</p>}
      </motion.div>
    </motion.div>
  );
}
