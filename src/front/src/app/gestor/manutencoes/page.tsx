'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Pencil, Trash2, Plus, Mail, ClipboardList, CheckCircle2, XCircle } from 'lucide-react';
import { api, ManutencaoDTO, SolicitacaoManutencaoDTO } from '@/lib/api';
import { TableSkeleton } from '@/components/LoadingSpinner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { FormModal } from '@/components/FormModal';

function notifySolicManutencaoChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sigac-solic-manutencao-changed'));
  }
}

export default function ManutencoesPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [list, setList] = useState<ManutencaoDTO[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoManutencaoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [solicitacaoPendenteId, setSolicitacaoPendenteId] = useState<number | null>(null);
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().slice(0, 10),
    tipo: 'PREVISTA' as 'PREVISTA' | 'EMERGENCIAL',
    prestador: '',
    instrucoesEmail: '',
  });
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<ManutencaoDTO | null>(null);
  const [editForm, setEditForm] = useState({
    descricao: '',
    valor: '',
    data: '',
    tipo: 'PREVISTA' as 'PREVISTA' | 'EMERGENCIAL',
    prestador: '',
    instrucoesEmail: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingManutencao, setDeletingManutencao] = useState<ManutencaoDTO | null>(null);
  const [rejeitandoSolic, setRejeitandoSolic] = useState<SolicitacaoManutencaoDTO | null>(null);

  const load = useCallback(() => {
    if (!condominioId) return;
    setLoading(true);
    Promise.all([
      api<ManutencaoDTO[]>(`/condominios/${condominioId}/manutencoes`),
      api<SolicitacaoManutencaoDTO[]>(`/condominios/${condominioId}/solicitacoes-manutencao`).catch(() => [] as SolicitacaoManutencaoDTO[]),
    ])
      .then(([manutencoes, sol]) => {
        setList(manutencoes);
        setSolicitacoes(sol);
        notifySolicManutencaoChanged();
      })
      .finally(() => setLoading(false));
  }, [condominioId]);

  useEffect(() => {
    load();
  }, [load]);

  const openNovaManutencao = () => {
    setSolicitacaoPendenteId(null);
    setForm({
      descricao: '',
      valor: '',
      data: new Date().toISOString().slice(0, 10),
      tipo: 'PREVISTA',
      prestador: '',
      instrucoesEmail: '',
    });
    setShowForm(true);
    setError('');
  };

  const abrirCadastroAPartirDeSolicitacao = (s: SolicitacaoManutencaoDTO) => {
    setSolicitacaoPendenteId(s.id);
    setForm({
      descricao: s.titulo,
      valor: '',
      data: new Date().toISOString().slice(0, 10),
      tipo: 'PREVISTA',
      prestador: '',
      instrucoesEmail: '',
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId) return;
    setError('');
    try {
      const body: Record<string, unknown> = {
        descricao: form.descricao,
        valor: Number(form.valor),
        data: form.data,
        tipo: form.tipo,
        prestador: form.prestador || undefined,
        instrucoesEmail: form.instrucoesEmail || undefined,
        condominioId: Number(condominioId),
      };
      if (solicitacaoPendenteId != null) body.solicitacaoId = solicitacaoPendenteId;
      await api(`/condominios/${condominioId}/manutencoes`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setForm({ descricao: '', valor: '', data: new Date().toISOString().slice(0, 10), tipo: 'PREVISTA', prestador: '', instrucoesEmail: '' });
      setSolicitacaoPendenteId(null);
      setShowForm(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro');
    }
  };

  const startEdit = (m: ManutencaoDTO) => {
    setEditing(m);
    setEditForm({
      descricao: m.descricao,
      valor: String(m.valor),
      data: m.data.slice(0, 10),
      tipo: m.tipo,
      prestador: m.prestador ?? '',
      instrucoesEmail: m.instrucoesEmail ?? '',
    });
    setError('');
  };

  const handleUpdate = async (notificar: boolean) => {
    if (!condominioId || !editing) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${condominioId}/manutencoes/${editing.id}?notificar=${notificar}`, {
        method: 'PUT',
        body: JSON.stringify({
          descricao: editForm.descricao,
          valor: Number(editForm.valor),
          data: editForm.data,
          tipo: editForm.tipo,
          prestador: editForm.prestador || undefined,
          instrucoesEmail: editForm.instrucoesEmail || undefined,
          condominioId: Number(condominioId),
        }),
      });
      setEditing(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (m: ManutencaoDTO) => {
    if (!condominioId) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${condominioId}/manutencoes/${m.id}`, { method: 'DELETE' });
      if (editing?.id === m.id) setEditing(null);
      setDeletingManutencao(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    } finally {
      setSubmitting(false);
    }
  };

  const reprovarSolicitacao = async (s: SolicitacaoManutencaoDTO) => {
    if (!condominioId) return;
    setSubmitting(true);
    setError('');
    try {
      await api(`/condominios/${condominioId}/solicitacoes-manutencao/${s.id}`, { method: 'DELETE' });
      setRejeitandoSolic(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao reprovar');
    } finally {
      setSubmitting(false);
    }
  };

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <TableSkeleton rows={6} />;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sigac-nav flex items-center gap-2">
            <Wrench className="w-8 h-8 text-sigac-accent" />
            Manutenções
          </h1>
          <p className="text-sm text-slate-500 mt-1">Ao cadastrar, os inquilinos recebem e-mail com a programação.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openNovaManutencao}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova manutenção
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="toast-error">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {solicitacoes.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="card rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3"
        >
          <h2 className="text-lg font-semibold text-sigac-nav flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-700" />
            Solicitações do síndico
          </h2>
          <p className="text-sm text-slate-600">Aprove para preencher o cadastro completo (a descrição já vem com o texto enviado pelo síndico). Reprove para descartar a solicitação.</p>
          <ul className="space-y-2">
            {solicitacoes.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/90 border border-amber-100 px-4 py-3 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sigac-nav">{s.titulo}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {s.solicitanteNome} · {new Date(s.criadoEm).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => abrirCadastroAPartirDeSolicitacao(s)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprovar e cadastrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejeitandoSolic(s)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reprovar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      <FormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSolicitacaoPendenteId(null);
        }}
        title={solicitacaoPendenteId != null ? 'Cadastrar manutenção (solicitação aprovada)' : 'Nova manutenção'}
        icon={<Wrench className="w-5 h-5 text-sigac-accent" />}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {solicitacaoPendenteId != null && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Título vindo do síndico está no campo descrição; você pode ajustar antes de salvar.
            </p>
          )}
          <input className="input" placeholder="Descrição (ex: manutenção no portão)" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} required />
          <input type="number" step="0.01" min="0" className="input" placeholder="Valor (R$)" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} required />
          <input type="date" className="input" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} required />
          <select className="input" value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as 'PREVISTA' | 'EMERGENCIAL' }))}>
            <option value="PREVISTA">Prevista</option>
            <option value="EMERGENCIAL">Emergencial</option>
          </select>
          <input className="input" placeholder="Prestador (ex: Joãozin)" value={form.prestador} onChange={(e) => setForm((f) => ({ ...f, prestador: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Instruções ou dica para o e-mail</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Ex.: Fique atento(a) às orientações. Este texto aparecerá no e-mail enviado aos inquilinos."
              value={form.instrucoesEmail}
              onChange={(e) => setForm((f) => ({ ...f, instrucoesEmail: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary">Cadastrar e notificar inquilinos</button>
            <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setSolicitacaoPendenteId(null); }}>Cancelar</button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Editar manutenção"
        icon={<Pencil className="w-5 h-5 text-sigac-accent" />}
        maxWidth="max-w-xl"
      >
        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); handleUpdate(false); }} className="space-y-3">
            <input className="input" placeholder="Descrição" value={editForm.descricao} onChange={(e) => setEditForm((f) => ({ ...f, descricao: e.target.value }))} required />
            <input type="number" step="0.01" min="0" className="input" placeholder="Valor (R$)" value={editForm.valor} onChange={(e) => setEditForm((f) => ({ ...f, valor: e.target.value }))} required />
            <input type="date" className="input" value={editForm.data} onChange={(e) => setEditForm((f) => ({ ...f, data: e.target.value }))} required />
            <select className="input" value={editForm.tipo} onChange={(e) => setEditForm((f) => ({ ...f, tipo: e.target.value as 'PREVISTA' | 'EMERGENCIAL' }))}>
              <option value="PREVISTA">Prevista</option>
              <option value="EMERGENCIAL">Emergencial</option>
            </select>
            <input className="input" placeholder="Prestador" value={editForm.prestador} onChange={(e) => setEditForm((f) => ({ ...f, prestador: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instruções ou dica para o e-mail</label>
              <textarea className="input min-h-[80px]" placeholder="Texto que aparece no e-mail aos inquilinos" value={editForm.instrucoesEmail} onChange={(e) => setEditForm((f) => ({ ...f, instrucoesEmail: e.target.value }))} rows={3} />
            </div>
            <div className="flex gap-2 flex-wrap pt-2">
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleUpdate(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-medium border-2 border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:border-sky-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Mail className="w-4 h-4" /> Salvar e notificar inquilinos
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </form>
        )}
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
                <th className="text-right p-3 font-semibold">Valor</th>
                <th className="w-28 p-3 font-semibold rounded-tr-2xl text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * i }}
                  className={`border-b border-slate-100 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-sigac-accent/5`}
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
                  <td className="p-2">
                    <div className="flex items-center justify-end gap-1">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="p-2 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors" onClick={() => startEdit(m)} title="Editar" aria-label="Editar">
                        <Pencil className="w-5 h-5" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors" onClick={() => setDeletingManutencao(m)} title="Excluir" aria-label="Excluir">
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && (
          <p className="p-8 text-slate-500 text-center">
            Nenhuma manutenção cadastrada. Clique em <strong>Nova manutenção</strong> para começar.
          </p>
        )}
      </motion.div>

      <ConfirmModal
        open={deletingManutencao !== null}
        onClose={() => setDeletingManutencao(null)}
        onConfirm={async () => { if (deletingManutencao) await handleDelete(deletingManutencao); }}
        title="Excluir esta manutenção?"
        description={deletingManutencao ? `"${deletingManutencao.descricao}" (${new Date(deletingManutencao.data).toLocaleDateString('pt-BR')}) será removida. Os inquilinos não serão mais notificados sobre este registro. Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={submitting}
        loadingLabel="Excluindo..."
      />

      <ConfirmModal
        open={rejeitandoSolic !== null}
        onClose={() => setRejeitandoSolic(null)}
        onConfirm={async () => { if (rejeitandoSolic) await reprovarSolicitacao(rejeitandoSolic); }}
        title="Reprovar solicitação?"
        description={rejeitandoSolic ? `A solicitação "${rejeitandoSolic.titulo}" será removida e não aparecerá mais.` : ''}
        confirmLabel="Sim, reprovar"
        cancelLabel="Cancelar"
        variant="danger"
        loading={submitting}
        loadingLabel="Removendo..."
      />
    </motion.div>
  );
}
