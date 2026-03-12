'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, DashboardGastosDTO, FuncionarioDTO, ManutencaoDTO, GastoProdutoDTO } from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#1b3266', '#2f6ce6', '#0ea5e9', '#10b981', '#f59e0b'];

function fmtMoney(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function fmtDate(s: string) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('pt-BR');
}

function mesAnoMatch(dataStr: string, ano: number, mes: number) {
  const part = String(dataStr).split('T')[0];
  const [y, m] = part.split('-').map(Number);
  return y === ano && m === mes;
}

export default function SindicoDashboardPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [data, setData] = useState<DashboardGastosDTO | null>(null);
  const [funcionariosList, setFuncionariosList] = useState<FuncionarioDTO[]>([]);
  const [manutencoesList, setManutencoesList] = useState<ManutencaoDTO[]>([]);
  const [gastosList, setGastosList] = useState<GastoProdutoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (!condominioId) return;
    setLoading(true);
    Promise.all([
      api<DashboardGastosDTO>(`/condominios/${condominioId}/dashboard/gastos-mensais?ano=${ano}&mes=${mes}`),
      api<FuncionarioDTO[]>(`/condominios/${condominioId}/funcionarios`).catch(() => []),
      api<ManutencaoDTO[]>(`/condominios/${condominioId}/manutencoes`).catch(() => []),
      api<GastoProdutoDTO[]>(`/condominios/${condominioId}/gastos-produto`).catch(() => []),
    ])
      .then(([dashboard, funcs, manuts, gastos]) => {
        setData(dashboard);
        setFuncionariosList(funcs ?? []);
        setManutencoesList(manuts ?? []);
        setGastosList(gastos ?? []);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [condominioId, ano, mes]);

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return (
    <div className="flex items-center gap-3 text-sigac-nav">
      <span className="inline-block w-5 h-5 border-2 border-sigac-accent border-t-transparent rounded-full animate-spin" />
      Carregando dashboard...
    </div>
  );

  const funcionarios = (data?.funcionarios && data.funcionarios.length > 0)
    ? data.funcionarios
    : funcionariosList.map((f) => ({ id: f.id, nome: f.nome, funcao: f.funcao, valorMensal: f.valorMensal }));
  const manutencoes = (data?.manutencoesDoMes && data.manutencoesDoMes.length > 0)
    ? data.manutencoesDoMes
    : manutencoesList
        .filter((m) => mesAnoMatch(m.data, ano, mes))
        .map((m) => ({ id: m.id, descricao: m.descricao, data: m.data, valor: m.valor, tipo: m.tipo, prestador: m.prestador }));
  const gastosProdutos = (data?.gastosProdutosDoMes && data.gastosProdutosDoMes.length > 0)
    ? data.gastosProdutosDoMes
    : gastosList
        .filter((g) => mesAnoMatch(g.data, ano, mes))
        .map((g) => ({ id: g.id, descricao: g.descricao, valor: g.valor, data: g.data, lojaFornecedor: g.lojaFornecedor }));
  const chartData = data?.itens?.map((i) => ({ name: i.categoria, value: i.valor })) ?? [];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-sigac-nav mb-1">Visão de gastos (somente leitura)</h1>
      <p className="text-sm text-slate-600 mb-6">Indicadores e detalhes para acompanhamento e relatório ao financeiro.</p>
      <div className="flex flex-wrap gap-4 mb-6">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Ano</span>
          <select className="input w-24 bg-white/90" value={ano} onChange={(e) => setAno(Number(e.target.value))}>
            {[ano - 1, ano, ano + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Mês</span>
          <select className="input w-36 bg-white/90" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}</option>
            ))}
          </select>
        </label>
      </div>
      {!data ? (
        <div className="card text-slate-600">Nenhum dado para o período.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="card border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white animate-slide-up">
              <p className="text-sm font-medium text-slate-600">Funcionários</p>
              <p className="text-xl font-bold text-sigac-nav mt-1">{fmtMoney(data.totalFuncionarios)}</p>
              <p className="text-xs text-slate-500 mt-1">{funcionarios.length} funcionário(s)</p>
            </div>
            <div className="card border-l-4 border-l-cyan-500 bg-gradient-to-br from-cyan-50 to-white animate-slide-up">
              <p className="text-sm font-medium text-slate-600">Produtos</p>
              <p className="text-xl font-bold text-cyan-800 mt-1">{fmtMoney(data.totalProdutos)}</p>
              <p className="text-xs text-slate-500 mt-1">{gastosProdutos.length} lançamento(s)</p>
            </div>
            <div className="card border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-white animate-slide-up">
              <p className="text-sm font-medium text-slate-600">Manutenções</p>
              <p className="text-xl font-bold text-emerald-800 mt-1">{fmtMoney(data.totalManutencoes)}</p>
              <p className="text-xs text-slate-500 mt-1">{manutencoes.length} manutenção(ões)</p>
            </div>
            <div className="card border-0 bg-gradient-to-br from-sigac-nav to-sigac-accent text-white shadow-lg animate-slide-up">
              <p className="text-sm font-medium text-white/90">Total do mês</p>
              <p className="text-2xl font-bold mt-1">{fmtMoney(data.totalGeral)}</p>
            </div>
          </div>
          {chartData.length > 0 && (
            <div className="card mb-6 overflow-visible animate-slide-up" style={{ height: 360 }}>
              <h2 className="text-lg font-semibold text-sigac-nav mb-2">Distribuição dos gastos</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart margin={{ top: 0, right: 8, bottom: 0, left: 8 }}>
                  <Pie data={chartData} cx="50%" cy="45%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtMoney(v)} />
                  <Legend
                    layout="vertical"
                    align="center"
                    verticalAlign="bottom"
                    wrapperStyle={{ paddingTop: 12 }}
                    formatter={(value) => <span className="text-sm text-slate-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-sigac-nav mb-2">Funcionários e valores mensais</h2>
            <div className="card overflow-hidden p-0 rounded-2xl">
              {funcionarios.length === 0 ? (
                <p className="p-4 text-slate-500 text-sm">Nenhum funcionário cadastrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-blue-50/50 text-sigac-nav border-b border-slate-200">
                        <th className="text-left p-3 font-semibold rounded-tl-2xl">Nome</th>
                        <th className="text-left p-3 font-semibold">Função</th>
                        <th className="text-right p-3 font-semibold rounded-tr-2xl">Valor mensal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {funcionarios.map((f, i) => (
                        <tr key={f.id} className={`border-b border-slate-100 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/30`}>
                          <td className="p-3">{f.nome}</td>
                          <td className="p-3">{f.funcao}</td>
                          <td className="p-3 text-right font-medium text-sigac-nav">{fmtMoney(f.valorMensal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-sigac-nav mb-2">Manutenções do mês</h2>
            <div className="card overflow-hidden p-0 rounded-2xl">
              {manutencoes.length === 0 ? (
                <p className="p-4 text-slate-500 text-sm">Nenhuma manutenção no período.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-emerald-50 to-emerald-50/50 text-emerald-800 border-b border-slate-200">
                        <th className="text-left p-3 font-semibold rounded-tl-2xl">Data</th>
                        <th className="text-left p-3 font-semibold">Descrição</th>
                        <th className="text-left p-3 font-semibold">Tipo</th>
                        <th className="text-left p-3 font-semibold">Prestador</th>
                        <th className="text-right p-3 font-semibold rounded-tr-2xl">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manutencoes.map((m, i) => (
                        <tr key={m.id} className={`border-b border-slate-100 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-emerald-50/30`}>
                          <td className="p-3">{fmtDate(m.data)}</td>
                          <td className="p-3">{m.descricao}</td>
                          <td className="p-3">{m.tipo === 'EMERGENCIAL' ? 'Emergencial' : 'Prevista'}</td>
                          <td className="p-3">{m.prestador ?? '—'}</td>
                          <td className="p-3 text-right font-medium text-sigac-nav">{fmtMoney(m.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-sigac-nav mb-2">Gastos com produtos no mês</h2>
            <div className="card overflow-hidden p-0 rounded-2xl">
              {gastosProdutos.length === 0 ? (
                <p className="p-4 text-slate-500 text-sm">Nenhum gasto com produtos no período.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-cyan-50 to-cyan-50/50 text-cyan-800 border-b border-slate-200">
                        <th className="text-left p-3 font-semibold rounded-tl-2xl">Data</th>
                        <th className="text-left p-3 font-semibold">Descrição</th>
                        <th className="text-left p-3 font-semibold">Loja/Fornecedor</th>
                        <th className="text-right p-3 font-semibold rounded-tr-2xl">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastosProdutos.map((g, i) => (
                        <tr key={g.id} className={`border-b border-slate-100 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-cyan-50/30`}>
                          <td className="p-3">{fmtDate(g.data)}</td>
                          <td className="p-3">{g.descricao ?? '—'}</td>
                          <td className="p-3">{g.lojaFornecedor ?? '—'}</td>
                          <td className="p-3 text-right font-medium text-sigac-nav">{fmtMoney(g.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="card bg-gradient-to-br from-slate-50 to-white border-slate-200/80">
            <h2 className="text-lg font-semibold text-sigac-nav mb-2">Resumo para relatório (financeiro)</h2>
            <p className="text-sm text-slate-600 mb-3">Use como base para prestação de contas.</p>
            <div className="text-sm text-slate-700 bg-white p-4 rounded-xl border border-slate-200 font-mono whitespace-pre-wrap shadow-inner">
{`Relatório mensal – ${data.nomeCondominio}
Período: ${new Date(ano, mes - 1).toLocaleString('pt-BR', { month: 'long' })}/${ano}

Totais:
• Funcionários: ${fmtMoney(data.totalFuncionarios)} (${funcionarios.length} funcionário(s))
• Produtos: ${fmtMoney(data.totalProdutos)} (${gastosProdutos.length} lançamento(s))
• Manutenções: ${fmtMoney(data.totalManutencoes)} (${manutencoes.length} manutenção(ões))
• TOTAL DO MÊS: ${fmtMoney(data.totalGeral)}

Detalhes nas tabelas acima.`}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
