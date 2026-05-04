'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { api, ArrecadacaoMensalDTO, ArrecadacaoMensalLogDTO } from '@/lib/api';
import { DashboardSkeleton } from '@/components/LoadingSpinner';
import { Pencil } from 'lucide-react';

function fmtMoney(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function parseMoneyInputToNumber(s: string): number {
  const raw = String(s ?? '').trim().replace(/\./g, '').replace(',', '.');
  const n = Number(raw);
  return n;
}

function monthNamePtBr(mes: number) {
  return new Date(2000, mes - 1, 1).toLocaleString('pt-BR', { month: 'long' });
}

type CardState = {
  dto: ArrecadacaoMensalDTO;
  input: string;
  saving: boolean;
  error: string | null;
};

export default function GestorArrecadacaoPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');

  const now = useMemo(() => new Date(), []);
  const [ano, setAno] = useState(now.getFullYear());
  const [mesFiltro, setMesFiltro] = useState<number | 'todos'>('todos');

  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Record<number, CardState>>({});
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [editando, setEditando] = useState(false);
  const [logs, setLogs] = useState<ArrecadacaoMensalLogDTO[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const mesesVisiveis = useMemo(() => {
    const anoAtual = now.getFullYear();
    const mesAtual = now.getMonth() + 1;
    const maxMes = ano === anoAtual ? mesAtual : 12;
    const lista = Array.from({ length: maxMes }, (_, i) => i + 1);
    if (mesFiltro === 'todos') return [...lista].reverse(); // mês atual primeiro, ordem decrescente
    return lista.includes(mesFiltro) ? [mesFiltro] : [];
  }, [ano, mesFiltro, now]);

  const anosDisponiveis = useMemo(() => {
    const anoAtual = now.getFullYear();
    // Mostra ano atual e anos anteriores (sem permitir futuro).
    // Aqui limitamos a exibir até 6 anos anteriores para não poluir a UI.
    const min = Math.max(2000, anoAtual - 5);
    const years: number[] = [];
    for (let y = anoAtual; y >= min; y--) years.push(y);
    return years;
  }, [now]);

  useEffect(() => {
    const anoAtual = now.getFullYear();
    if (ano > anoAtual) setAno(anoAtual);
  }, [ano, now]);

  const mesesSelectMax = useMemo(() => {
    const anoAtual = now.getFullYear();
    const mesAtual = now.getMonth() + 1;
    return ano === anoAtual ? mesAtual : 12;
  }, [ano, now]);

  useEffect(() => {
    if (!condominioId) return;
    let cancelled = false;
    setLoading(true);
    setCards({});
    setMesSelecionado(null);
    setEditando(false);
    setLogs([]);

    Promise.all(
      mesesVisiveis.map(async (m) => {
        const dto = await api<ArrecadacaoMensalDTO>(`/condominios/${condominioId}/arrecadacao-mensal?ano=${ano}&mes=${m}`);
        return [m, dto] as const;
      })
    )
      .then((entries) => {
        if (cancelled) return;
        const next: Record<number, CardState> = {};
        for (const [m, dto] of entries) {
          next[m] = {
            dto,
            input: dto.valor ? String(dto.valor).replace('.', ',') : '',
            saving: false,
            error: null,
          };
        }
        setCards(next);
        // Seleciona automaticamente o mês atual quando estiver visível.
        const mesAtual = now.getMonth() + 1;
        const candidato = (ano === now.getFullYear() && mesesVisiveis.includes(mesAtual)) ? mesAtual : mesesVisiveis[0] ?? null;
        setMesSelecionado(candidato);
      })
      .catch(() => {
        if (cancelled) return;
        setCards({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [condominioId, ano, mesesVisiveis]);

  useEffect(() => {
    if (!condominioId || !mesSelecionado) return;
    let cancelled = false;
    setLogsLoading(true);
    api<ArrecadacaoMensalLogDTO[]>(`/condominios/${condominioId}/arrecadacao-mensal/logs?ano=${ano}&mes=${mesSelecionado}`)
      .then((list) => {
        if (!cancelled) setLogs(list ?? []);
      })
      .catch(() => {
        if (!cancelled) setLogs([]);
      })
      .finally(() => {
        if (!cancelled) setLogsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [condominioId, ano, mesSelecionado]);

  const handleSalvar = async (mes: number, inputValue: string) => {
    if (!condominioId) return;
    setCards((prev) => {
      const c = prev[mes];
      if (!c) return prev;
      return { ...prev, [mes]: { ...c, saving: true, error: null } };
    });

    try {
      const valor = parseMoneyInputToNumber(inputValue ?? '');
      if (!Number.isFinite(valor) || valor < 0) throw new Error('Informe um valor válido (ex.: 5000,00).');

      const payload: ArrecadacaoMensalDTO = {
        condominioId: Number(condominioId),
        ano,
        mes,
        valor,
      };
      const saved = await api<ArrecadacaoMensalDTO>(`/condominios/${condominioId}/arrecadacao-mensal`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setCards((prev) => {
        const old = prev[mes];
        if (!old) return prev;
        return {
          ...prev,
          [mes]: {
            ...old,
            dto: saved,
            input: String(saved.valor).replace('.', ','),
            saving: false,
            error: null,
          },
        };
      });
      setEditando(false);
      // Recarrega logs do mês (para refletir a alteração)
      const list = await api<ArrecadacaoMensalLogDTO[]>(`/condominios/${condominioId}/arrecadacao-mensal/logs?ano=${ano}&mes=${mes}`);
      setLogs(list ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Não foi possível salvar.';
      setCards((prev) => {
        const old = prev[mes];
        if (!old) return prev;
        return { ...prev, [mes]: { ...old, saving: false, error: msg } };
      });
    }
  };

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <DashboardSkeleton />;

  const cardSelecionado = mesSelecionado ? cards[mesSelecionado] : null;
  const informado = !!(cardSelecionado?.dto?.id);
  const podeEditarCampo = !informado || editando;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-sigac-nav mb-1">Arrecadação mensal</h1>
      <p className="text-sm text-slate-600 mb-6">
        A cada novo mês, um novo card aparece para você informar o valor arrecadado daquele período (um único valor por mês).
      </p>

      <div className="flex flex-wrap gap-4 mb-2">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Ano</span>
          <select
            className="input w-24 bg-white/90"
            value={ano}
            onChange={(e) => {
              const nextAno = Number(e.target.value);
              setAno(nextAno);
              // Se o mês selecionado não existe no novo ano (ex.: ano atual com limite), volta para "todos"
              const maxMes = nextAno === now.getFullYear() ? (now.getMonth() + 1) : 12;
              if (mesFiltro !== 'todos' && mesFiltro > maxMes) setMesFiltro('todos');
            }}
          >
            {anosDisponiveis.map((y) => (
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
          >
            <option value="todos">Todos</option>
            {Array.from({ length: mesesSelectMax }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{monthNamePtBr(m)}</option>
            ))}
          </select>
        </label>
      </div>

      {mesesVisiveis.length === 0 ? (
        <div className="card text-slate-600">Nenhum mês disponível para o filtro selecionado.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {mesesVisiveis.map((m) => {
                const c = cards[m];
                const valorAtual = c?.dto?.valor ?? 0;
                const preenchido = !!(c?.dto?.id);
                const active = mesSelecionado === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMesSelecionado(m);
                      setEditando(false);
                      setCards((prev) => {
                        const old = prev[m];
                        if (!old) return prev;
                        return { ...prev, [m]: { ...old, error: null } };
                      });
                    }}
                    className={`text-left card border transition ${active ? 'border-sigac-accent ring-2 ring-sigac-accent/25' : 'border-slate-200/80 hover:border-slate-300'} bg-gradient-to-br from-white to-slate-50`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-600">Mês</p>
                        <p className="text-lg font-bold text-sigac-nav capitalize truncate">{monthNamePtBr(m)} / {ano}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${preenchido ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                        {preenchido ? 'Preenchido' : 'Pendente'}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-slate-600">Valor</p>
                      <p className="text-2xl font-extrabold text-emerald-700">{fmtMoney(valorAtual)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="card border border-slate-200/80 bg-white/95 backdrop-blur">
            {!mesSelecionado || !cardSelecionado ? (
              <p className="text-sm text-slate-600">Selecione um mês para ver detalhes e o log.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-600">Período</p>
                    <p className="text-lg font-bold text-sigac-nav capitalize truncate">{monthNamePtBr(mesSelecionado)} / {ano}</p>
                    <p className="text-sm text-slate-600 mt-1">Valor atual: <span className="font-semibold text-emerald-700">{fmtMoney(cardSelecionado.dto.valor ?? 0)}</span></p>
                  </div>
                  {informado && !editando && (
                    <button
                      type="button"
                      className="shrink-0 p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                      title="Editar valor"
                      onClick={() => {
                        setCards((prev) => {
                          const old = prev[mesSelecionado];
                          if (!old) return prev;
                          return { ...prev, [mesSelecionado]: { ...old, error: null } };
                        });
                        setEditando(true);
                      }}
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Informar valor</label>
                  <input
                    className="input w-full"
                    placeholder="Ex.: 5000,00"
                    value={cardSelecionado.input ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCards((prev) => {
                        const old = prev[mesSelecionado];
                        if (!old) return prev;
                        return { ...prev, [mesSelecionado]: { ...old, input: v, error: null } };
                      });
                    }}
                    inputMode="decimal"
                    disabled={!podeEditarCampo || cardSelecionado.saving}
                  />
                  {cardSelecionado.error && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {cardSelecionado.error}
                    </div>
                  )}
                  {(podeEditarCampo) && (
                    <button
                      type="button"
                      className="btn-primary w-full"
                      disabled={cardSelecionado.saving}
                      onClick={() => void handleSalvar(mesSelecionado, cardSelecionado.input ?? '')}
                    >
                      {cardSelecionado.saving ? 'Salvando...' : 'Salvar'}
                    </button>
                  )}
                  {informado && editando && (
                    <button
                      type="button"
                      className="btn-secondary w-full"
                      onClick={() => setEditando(false)}
                      disabled={cardSelecionado.saving}
                    >
                      Cancelar edição
                    </button>
                  )}
                  {informado && !editando && (
                    <p className="text-xs text-slate-500">Para alterar, clique no ícone de editar.</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-sigac-nav">Log do mês</h2>
                    {logsLoading && <span className="text-xs text-slate-500">Carregando...</span>}
                  </div>
                  {logs.length === 0 ? (
                    <p className="text-sm text-slate-600 mt-2">Nenhuma alteração registrada.</p>
                  ) : (
                    <div className="mt-2 overflow-x-auto overflow-y-auto max-h-[176px]">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-slate-600 border-b border-slate-200">
                            <th className="py-2 pr-2">Usuário</th>
                            <th className="py-2 pr-2">Data</th>
                            <th className="py-2">Alteração</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map((l) => (
                            <tr key={l.id} className="border-b border-slate-100">
                              <td className="py-2 pr-2">
                                <span className="font-medium text-slate-800">{l.userNome || l.userEmail || '—'}</span>
                              </td>
                              <td className="py-2 pr-2 whitespace-nowrap">{new Date(l.alteradoEm).toLocaleString('pt-BR')}</td>
                              <td className="py-2">
                                {l.acao === 'CRIAR'
                                  ? `Definiu ${fmtMoney(l.valorNovo)}`
                                  : `De ${fmtMoney(Number(l.valorAnterior ?? 0))} para ${fmtMoney(l.valorNovo)}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </motion.div>
  );
}
