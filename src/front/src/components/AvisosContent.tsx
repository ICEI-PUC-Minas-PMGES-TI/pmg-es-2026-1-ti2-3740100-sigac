'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Send, Users } from 'lucide-react';
import { AlcanceAviso, api, AvisoDTO, InquilinoDTO } from '@/lib/api';
import { TableSkeleton } from '@/components/LoadingSpinner';
import { FormModal } from '@/components/FormModal';

interface AvisosContentProps {
  readOnly?: boolean;
}

function monthNamePtBr(mes: number) {
  return new Date(2000, mes - 1, 1).toLocaleString('pt-BR', { month: 'long' });
}

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00`);
}

function getStatusLabel(dataReferencia: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return parseDateOnly(dataReferencia) < hoje ? 'JÁ PASSOU' : 'ATIVO';
}

function renderDestinatarios(aviso: AvisoDTO) {
  if (aviso.alcance === 'TODOS') return 'Todos os inquilinos';
  if (aviso.destinatarios.length === 0) return 'Inquilinos específicos';
  if (aviso.destinatarios.length <= 2) {
    return aviso.destinatarios.map((destinatario) => destinatario.nome).join(', ');
  }
  return `${aviso.destinatarios[0]?.nome}, ${aviso.destinatarios[1]?.nome} +${aviso.destinatarios.length - 2}`;
}

export function AvisosContent({ readOnly = false }: AvisosContentProps) {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [avisos, setAvisos] = useState<AvisoDTO[]>([]);
  const [inquilinos, setInquilinos] = useState<InquilinoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const now = useMemo(() => new Date(), []);
  const [anoFiltro, setAnoFiltro] = useState<number | 'todos'>(now.getFullYear());
  const [mesFiltro, setMesFiltro] = useState<number | 'todos'>(now.getMonth() + 1);
  const [form, setForm] = useState({
    titulo: '',
    mensagem: '',
    dataReferencia: new Date().toISOString().slice(0, 10),
    alcance: 'TODOS' as AlcanceAviso,
    destinatarioIds: [] as number[],
  });

  const load = () => {
    if (!condominioId) return;
    setLoading(true);
    const requests: Promise<unknown>[] = [api<AvisoDTO[]>(`/condominios/${condominioId}/avisos`)];
    if (!readOnly) {
      requests.push(api<InquilinoDTO[]>(`/condominios/${condominioId}/inquilinos`));
    }
    Promise.all(requests)
      .then(([avisosResponse, inquilinosResponse]) => {
        setAvisos(avisosResponse as AvisoDTO[]);
        setInquilinos((inquilinosResponse as InquilinoDTO[]) ?? []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar avisos');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [condominioId, readOnly]);

  const resetForm = () => {
    setForm({
      titulo: '',
      mensagem: '',
      dataReferencia: new Date().toISOString().slice(0, 10),
      alcance: 'TODOS',
      destinatarioIds: [],
    });
  };

  const handleToggleDestinatario = (inquilinoId: number) => {
    setForm((current) => ({
      ...current,
      destinatarioIds: current.destinatarioIds.includes(inquilinoId)
        ? current.destinatarioIds.filter((id) => id !== inquilinoId)
        : [...current.destinatarioIds, inquilinoId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId || readOnly) return;
    if (form.alcance === 'ESPECIFICOS' && form.destinatarioIds.length === 0) {
      setError('Selecione ao menos um inquilino para enviar o aviso específico.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${condominioId}/avisos`, {
        method: 'POST',
        body: JSON.stringify({
          titulo: form.titulo,
          mensagem: form.mensagem,
          dataReferencia: form.dataReferencia,
          alcance: form.alcance,
          condominioId: Number(condominioId),
          destinatarios: form.alcance === 'ESPECIFICOS'
            ? form.destinatarioIds.map((inquilinoId) => ({ inquilinoId }))
            : [],
        }),
      });
      setShowForm(false);
      resetForm();
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar aviso');
    } finally {
      setSubmitting(false);
    }
  };

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <TableSkeleton rows={6} />;

  const filteredAvisos = (anoFiltro === 'todos' && mesFiltro === 'todos')
    ? avisos
    : avisos.filter((aviso) => {
      const data = parseDateOnly(aviso.dataReferencia);
      const ano = data.getFullYear();
      const mes = data.getMonth() + 1;
      if (anoFiltro !== 'todos' && ano !== anoFiltro) return false;
      if (mesFiltro !== 'todos' && mes !== mesFiltro) return false;
      return true;
    });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sigac-nav flex items-center gap-2">
            <Bell className="w-8 h-8 text-sigac-accent" />
            Avisos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {readOnly
              ? 'Acompanhe todos os avisos enviados, inclusive os gerados por manutenções.'
              : 'Cadastre avisos gerais, envie para todos ou para inquilinos específicos e acompanhe o histórico completo.'}
          </p>
        </div>
        {!readOnly && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { resetForm(); setShowForm(true); setError(''); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo aviso
          </motion.button>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Ano</span>
          <select
            className="input w-28 bg-white/90"
            value={anoFiltro}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'todos') {
                setAnoFiltro('todos');
                setMesFiltro('todos');
                return;
              }
              setAnoFiltro(Number(value));
            }}
          >
            <option value="todos">Todos</option>
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((ano) => (
              <option key={ano} value={ano}>{ano}</option>
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
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mes) => (
              <option key={mes} value={mes}>{monthNamePtBr(mes)}</option>
            ))}
          </select>
        </label>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="toast-error fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[min(720px,calc(100%-2rem))]"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {!readOnly && (
        <FormModal
          open={showForm}
          onClose={() => setShowForm(false)}
          title="Novo aviso"
          icon={<Send className="w-5 h-5 text-sigac-accent" />}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="input"
              placeholder="Título do aviso"
              value={form.titulo}
              onChange={(e) => setForm((current) => ({ ...current, titulo: e.target.value }))}
              required
            />
            <textarea
              className="input min-h-[140px]"
              placeholder="Descreva o aviso que será enviado aos inquilinos."
              value={form.mensagem}
              onChange={(e) => setForm((current) => ({ ...current, mensagem: e.target.value }))}
              rows={6}
              required
            />
            <input
              type="date"
              className="input"
              value={form.dataReferencia}
              onChange={(e) => setForm((current) => ({ ...current, dataReferencia: e.target.value }))}
              required
            />
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, alcance: 'TODOS', destinatarioIds: [] }))}
                className={`rounded-2xl border p-4 text-left transition-colors ${form.alcance === 'TODOS' ? 'border-sigac-accent bg-sigac-accent/5' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <span className="text-sm font-semibold text-sigac-nav block">Aviso para todos</span>
                <span className="text-sm text-slate-500 block mt-1">Todos os inquilinos do condomínio recebem o e-mail.</span>
              </button>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, alcance: 'ESPECIFICOS' }))}
                className={`rounded-2xl border p-4 text-left transition-colors ${form.alcance === 'ESPECIFICOS' ? 'border-sigac-accent bg-sigac-accent/5' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <span className="text-sm font-semibold text-sigac-nav block">Aviso para alguns</span>
                <span className="text-sm text-slate-500 block mt-1">Selecione apenas os inquilinos que devem receber o e-mail.</span>
              </button>
            </div>

            {form.alcance === 'ESPECIFICOS' && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-sigac-accent" />
                  <p className="text-sm font-medium text-sigac-nav">Inquilinos destinatários</p>
                </div>
                <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
                  {inquilinos.map((inquilino) => (
                    <label
                      key={inquilino.id}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 cursor-pointer hover:border-slate-300"
                    >
                      <input
                        type="checkbox"
                        checked={form.destinatarioIds.includes(inquilino.id)}
                        onChange={() => handleToggleDestinatario(inquilino.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-sigac-accent focus:ring-sigac-accent"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-800">{inquilino.nome}</span>
                        <span className="block text-xs text-slate-500">{inquilino.email}</span>
                      </span>
                    </label>
                  ))}
                  {inquilinos.length === 0 && (
                    <p className="text-sm text-slate-500">Nenhum inquilino cadastrado para selecionar.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar aviso'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </FormModal>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card overflow-hidden p-0 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-sigac-accent/10 to-sigac-accent/5 text-sigac-nav border-b border-slate-200">
                <th className="text-left p-3 font-semibold rounded-tl-2xl">Data</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Origem</th>
                <th className="text-left p-3 font-semibold">Alcance</th>
                <th className="text-left p-3 font-semibold">Título</th>
                <th className="text-left p-3 font-semibold">Destinatários</th>
                <th className="text-left p-3 font-semibold rounded-tr-2xl">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {filteredAvisos.map((aviso, index) => {
                const status = getStatusLabel(aviso.dataReferencia);
                return (
                  <motion.tr
                    key={aviso.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.02 * index }}
                    className={`border-b border-slate-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-sigac-accent/5`}
                  >
                    <td className="p-3 align-top text-slate-700">
                      <p>{parseDateOnly(aviso.dataReferencia).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-slate-500 mt-1">Enviado em {new Date(aviso.criadoEm).toLocaleString('pt-BR')}</p>
                    </td>
                    <td className="p-3 align-top">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${status === 'ATIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-3 align-top">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${aviso.origem === 'MANUTENCAO' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}`}>
                        {aviso.origem === 'MANUTENCAO' ? 'Manutenção' : 'Geral'}
                      </span>
                    </td>
                    <td className="p-3 align-top">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${aviso.alcance === 'TODOS' ? 'bg-indigo-100 text-indigo-800' : 'bg-fuchsia-100 text-fuchsia-800'}`}>
                        {aviso.alcance === 'TODOS' ? 'Todos' : 'Específico'}
                      </span>
                    </td>
                    <td className="p-3 align-top">
                      <p className="font-medium text-slate-800">{aviso.titulo}</p>
                    </td>
                    <td className="p-3 align-top text-slate-600">
                      {renderDestinatarios(aviso)}
                    </td>
                    <td className="p-3 align-top text-slate-600 whitespace-pre-line min-w-[260px]">{aviso.mensagem}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredAvisos.length === 0 && (
          <p className="p-8 text-slate-500 text-center">
            Nenhum aviso encontrado para o filtro selecionado.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
