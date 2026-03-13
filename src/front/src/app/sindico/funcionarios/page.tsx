'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { api, FuncionarioDTO } from '@/lib/api';
import { TableSkeleton } from '@/components/LoadingSpinner';

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
  if (loading) return <TableSkeleton rows={6} />;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-sigac-nav flex items-center gap-2">
        <Users className="w-8 h-8 text-sigac-accent" />
        Funcionários (visualização)
      </h1>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card overflow-hidden p-0 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-sigac-accent/10 to-sigac-accent/5 text-sigac-nav border-b border-slate-200">
                <th className="text-left p-3 font-semibold rounded-tl-2xl">Nome</th>
                <th className="text-left p-3 font-semibold">Função</th>
                <th className="text-right p-3 font-semibold rounded-tr-2xl">Valor mensal</th>
              </tr>
            </thead>
            <tbody>
              {list.map((f, i) => (
                <motion.tr
                  key={f.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * i }}
                  className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-sigac-accent/5 transition-colors`}
                >
                  <td className="p-3 font-medium text-slate-800">{f.nome}</td>
                  <td className="p-3 text-slate-600">{f.funcao}</td>
                  <td className="p-3 text-right font-medium text-sigac-nav">R$ {Number(f.valorMensal).toFixed(2).replace('.', ',')}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="p-8 text-slate-500 text-center">Nenhum funcionário cadastrado.</p>}
      </motion.div>
    </motion.div>
  );
}
