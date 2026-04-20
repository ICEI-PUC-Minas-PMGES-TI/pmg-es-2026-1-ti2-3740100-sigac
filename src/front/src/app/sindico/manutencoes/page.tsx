'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Send } from 'lucide-react';
import { api, ManutencaoDTO } from '@/lib/api';
import { TableSkeleton } from '@/components/LoadingSpinner';
import { FormModal } from '@/components/FormModal';

function monthNamePtBr(mes: number) {
  return new Date(2000, mes - 1, 1).toLocaleString('pt-BR', { month: 'long' });
}

export default function SindicoManutencoesPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [list, setList] = useState<ManutencaoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const now = useMemo(() => new Date(), []);
  const [anoFiltro, setAnoFiltro] = useState<number | 'todos'>(now.getFullYear());
  const [mesFiltro, setMesFiltro] = useState<number | 'todos'>(now.getMonth() + 1);
  const [showSolic, setShowSolic] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!condominioId) return;
    setLoading(true);
    api<ManutencaoDTO[]>(`/condominios/${condominioId}/manutencoes`).then(setList).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [condominioId]);

  const enviarSolicitacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${condominioId}/solicitacoes-manutencao`, {
        method: 'POST',
        body: JSON.stringify({ titulo: titulo.trim() }),
      });
      setTitulo('');
      setShowSolic(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setSubmitting(false);
    }
  };

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <TableSkeleton rows={6} />;

  const filteredList = (anoFiltro === 'todos' && mesFiltro === 'todos')
    ? list
    : list.filter((m) => {
      const d = new Date(m.data);
      const y = d.getFullYear();
      const mm = d.getMonth() + 1;
      if (anoFiltro !== 'todos' && y !== anoFiltro) return false;
      if (mesFiltro !== 'todos' && mm !== mesFiltro) return false;
      return true;
    });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sigac-nav flex items-center gap-2">
            <Wrench className="w-8 h-8 text-sigac-accent" />
            Manutenções
          </h1>
          <p className="text-sm text-slate-500 mt-1">Visualize as manutenções cadastradas. Você pode solicitar ao gestor o que precisa ser arrumado.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => { setShowSolic(true); setError(''); }}
          className="btn-primary flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
          Solicitar manutenção
        </motion.button>
      </div>

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

      <AnimatePresence mode="wait">
        {error && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="toast-error">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <FormModal
        open={showSolic}
        onClose={() => { setShowSolic(false); setError(''); }}
        title="Solicitar manutenção ao gestor"
        icon={<Send className="w-5 h-5 text-sigac-accent" />}
        maxWidth="max-w-lg"
      >
        <form onSubmit={enviarSolicitacao} className="space-y-3">
          <p className="text-sm text-slate-600">Descreva apenas o que deve ser arrumado. O gestor do condomínio receberá a solicitação para aprovar ou reprovar.</p>
          <textarea
            className="input min-h-[100px]"
            placeholder="Ex.: Portão da garagem está rangendo e precisa de lubrificação."
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            maxLength={500}
            rows={4}
          />
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar solicitação'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowSolic(false)}>Cancelar</button>
          </div>
        </form>
      </FormModal>

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
              {filteredList.map((m, i) => (
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
        {filteredList.length === 0 && <p className="p-8 text-slate-500 text-center">Nenhuma manutenção encontrada para o filtro selecionado.</p>}
      </motion.div>
    </motion.div>
  );
}
