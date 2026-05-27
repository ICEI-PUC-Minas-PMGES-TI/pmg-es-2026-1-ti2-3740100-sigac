'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt } from 'lucide-react';
import { api, GastoProdutoDTO } from '@/lib/api';
import { TableSkeleton } from '@/components/LoadingSpinner';

function monthNamePtBr(mes: number) {
  return new Date(2000, mes - 1, 1).toLocaleString('pt-BR', { month: 'long' });
}

export default function SindicoGastosPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [list, setList] = useState<GastoProdutoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const now = useMemo(() => new Date(), []);
  const [anoFiltro, setAnoFiltro] = useState<number | 'todos'>(now.getFullYear());
  const [mesFiltro, setMesFiltro] = useState<number | 'todos'>(now.getMonth() + 1);

  useEffect(() => {
    if (!condominioId) return;
    api<GastoProdutoDTO[]>(`/condominios/${condominioId}/gastos-produto`).then(setList).finally(() => setLoading(false));
  }, [condominioId]);

  const filteredList = useMemo(() => {
    if (anoFiltro === 'todos' && mesFiltro === 'todos') return list;
    return list.filter((g) => {
      const d = new Date(g.data);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      if (anoFiltro !== 'todos' && y !== anoFiltro) return false;
      if (mesFiltro !== 'todos' && m !== mesFiltro) return false;
      return true;
    });
  }, [list, anoFiltro, mesFiltro]);

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <TableSkeleton rows={6} />;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-sigac-nav flex items-center gap-2">
        <Receipt className="w-8 h-8 text-sigac-accent" />
        Gastos com produtos (visualização)
      </h1>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Ano</span>
          <select
            className="input w-28 bg-white/90"
            value={anoFiltro}
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'todos') {
                setAnoFiltro('todos');
                setMesFiltro('todos');
              } else {
                setAnoFiltro(Number(v));
              }
            }}
          >
            <option value="todos">Todos</option>
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Mês</span>
          <select
            className="input w-40 bg-white/90"
            value={mesFiltro}
            onChange={(e) => setMesFiltro(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            disabled={anoFiltro === 'todos'}
            title={anoFiltro === 'todos' ? 'Selecione um ano para filtrar por mês' : undefined}
          >
            <option value="todos">Todos</option>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
              <option key={m} value={m}>{monthNamePtBr(m)}</option>
            ))}
          </select>
        </label>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card overflow-hidden p-0 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-sigac-accent/10 to-sigac-accent/5 text-sigac-nav border-b border-slate-200">
                <th className="text-left p-3 font-semibold rounded-tl-2xl">Data</th>
                <th className="text-left p-3 font-semibold">Descrição</th>
                <th className="text-left p-3 font-semibold">Loja</th>
                <th className="text-right p-3 font-semibold rounded-tr-2xl">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((g, i) => (
                <motion.tr
                  key={g.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * i }}
                  className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-sigac-accent/5 transition-colors`}
                >
                  <td className="p-3 text-slate-700">{new Date(g.data).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 text-slate-600">{g.descricao ?? '—'}</td>
                  <td className="p-3 text-slate-600">{g.lojaFornecedor ?? '—'}</td>
                  <td className="p-3 text-right font-medium text-sigac-nav">R$ {Number(g.valor).toFixed(2).replace('.', ',')}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredList.length === 0 && <p className="p-8 text-slate-500 text-center">Nenhum gasto encontrado para o filtro selecionado.</p>}
      </motion.div>
    </motion.div>
  );
}
