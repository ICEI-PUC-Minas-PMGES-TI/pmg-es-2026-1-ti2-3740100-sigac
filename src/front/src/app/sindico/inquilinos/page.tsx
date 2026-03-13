'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { api, InquilinoDTO } from '@/lib/api';
import { TableSkeleton } from '@/components/LoadingSpinner';

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
  if (loading) return <TableSkeleton rows={6} />;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-sigac-nav flex items-center gap-2">
        <Users className="w-8 h-8 text-sigac-accent" />
        Inquilinos (visualização)
      </h1>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card overflow-hidden p-0 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-sigac-accent/10 to-sigac-accent/5 text-sigac-nav border-b border-slate-200">
                <th className="text-left p-3 font-semibold rounded-tl-2xl">Nome</th>
                <th className="text-left p-3 font-semibold rounded-tr-2xl">E-mail</th>
              </tr>
            </thead>
            <tbody>
              {list.map((i, idx) => (
                <motion.tr
                  key={i.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * idx }}
                  className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-sigac-accent/5 transition-colors`}
                >
                  <td className="p-3 font-medium text-slate-800">{i.nome}</td>
                  <td className="p-3 text-slate-600">{i.email}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="p-8 text-slate-500 text-center">Nenhum inquilino cadastrado.</p>}
      </motion.div>
    </motion.div>
  );
}
