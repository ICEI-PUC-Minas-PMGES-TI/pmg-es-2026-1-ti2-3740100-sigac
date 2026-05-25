'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Pencil, Trash2, Users } from 'lucide-react';
import { api, FuncionarioDTO } from '@/lib/api';
import { TableSkeleton } from '@/components/LoadingSpinner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { FormModal } from '@/components/FormModal';

export default function FuncionariosPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const [funcionarios, setFuncionarios] = useState<FuncionarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [funcionarioForm, setFuncionarioForm] = useState({
    nome: '',
    funcao: 'Porteiro',
    funcaoOutro: '',
    valorMensal: '',
  });
  const [error, setError] = useState('');
  const [editingFuncionarioId, setEditingFuncionarioId] = useState<number | null>(null);
  const [deletingFuncionarioId, setDeletingFuncionarioId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const carregarFuncionarios = () => {
    if (!condominioId) return;
    api<FuncionarioDTO[]>(`/condominios/${condominioId}/funcionarios`)
      .then(setFuncionarios)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarFuncionarios();
  }, [condominioId]);

  const funcaoParaEnvio =
    funcionarioForm.funcao === 'Outro'
      ? funcionarioForm.funcaoOutro?.trim() || 'Outro'
      : funcionarioForm.funcao;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId) return;
    if (funcionarioForm.funcao === 'Outro' && !funcionarioForm.funcaoOutro?.trim()) {
      setError('Informe a função quando selecionar "Outro".');
      return;
    }
    setError('');
    try {
      const funcionarioPayload = {
        nome: funcionarioForm.nome,
        funcao: funcaoParaEnvio,
        valorMensal: Number(funcionarioForm.valorMensal),
        condominioId: Number(condominioId),
      };

      if (editingFuncionarioId) {
        await api(`/condominios/${condominioId}/funcionarios/${editingFuncionarioId}`, {
          method: 'PUT',
          body: JSON.stringify(funcionarioPayload),
        });
        setEditingFuncionarioId(null);
      } else {
        await api(`/condominios/${condominioId}/funcionarios`, {
          method: 'POST',
          body: JSON.stringify(funcionarioPayload),
        });
      }
      setFuncionarioForm({ nome: '', funcao: 'Porteiro', funcaoOutro: '', valorMensal: '' });
      setShowForm(false);
      carregarFuncionarios();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleDelete = async (id: number) => {
    if (!condominioId) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${condominioId}/funcionarios/${id}`, { method: 'DELETE' });
      setDeletingFuncionarioId(null);
      carregarFuncionarios();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    } finally {
      setSubmitting(false);
    }
  };

  const funcoes = ['Porteiro', 'Zelador', 'Eletricista', 'Pedreiro', 'Outro'];

  const isFuncaoOutro = funcionarioForm.funcao === 'Outro';
  const aoAbrirFormularioFuncionario = (funcionario?: FuncionarioDTO) => {
    const funcao = funcionario?.funcao ?? 'Porteiro';
    const ehOutro = funcoes.indexOf(funcao) < 0;
    setFuncionarioForm({
      nome: funcionario?.nome ?? '',
      funcao: ehOutro ? 'Outro' : funcao,
      funcaoOutro: ehOutro ? funcao : '',
      valorMensal: funcionario != null ? String(funcionario.valorMensal) : '',
    });
    setEditingFuncionarioId(funcionario?.id ?? null);
    setShowForm(true);
  };

  const deletingFuncionario = funcionarios.find((funcionario) => funcionario.id === deletingFuncionarioId);

  if (!condominioId) return <div className="card">Selecione um condomínio.</div>;
  if (loading) return <TableSkeleton rows={6} />;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-sigac-nav flex items-center gap-2">
          <Users className="w-8 h-8 text-sigac-accent" />
          Funcionários
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => aoAbrirFormularioFuncionario()}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Novo funcionário
        </motion.button>
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

      <FormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingFuncionarioId(null);
          setFuncionarioForm({ nome: '', funcao: 'Porteiro', funcaoOutro: '', valorMensal: '' });
        }}
        title={editingFuncionarioId ? 'Editar funcionário' : 'Novo funcionário'}
        icon={<UserPlus className="w-5 h-5 text-sigac-accent" />}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="input"
            placeholder="Nome"
            value={funcionarioForm.nome}
            onChange={(e) => setFuncionarioForm((currentForm) => ({ ...currentForm, nome: e.target.value }))}
            required
          />
          <select
            className="input"
            value={funcionarioForm.funcao}
            onChange={(e) =>
              setFuncionarioForm((currentForm) => ({
                ...currentForm,
                funcao: e.target.value,
                funcaoOutro: e.target.value === 'Outro' ? currentForm.funcaoOutro : '',
              }))
            }
          >
            {funcoes.map((funcao) => (
              <option key={funcao} value={funcao}>
                {funcao}
              </option>
            ))}
          </select>
          {isFuncaoOutro && (
            <input
              className="input"
              placeholder="Qual a função? (ex.: Pintor, Encanador)"
              value={funcionarioForm.funcaoOutro}
              onChange={(e) => setFuncionarioForm((currentForm) => ({ ...currentForm, funcaoOutro: e.target.value }))}
            />
          )}
          <input
            type="number"
            step="0.01"
            min="0"
            className="input"
            placeholder="Valor mensal (R$)"
            value={funcionarioForm.valorMensal}
            onChange={(e) => setFuncionarioForm((currentForm) => ({ ...currentForm, valorMensal: e.target.value }))}
            required
          />
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary">
              {editingFuncionarioId ? 'Salvar' : 'Cadastrar'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditingFuncionarioId(null);
                setFuncionarioForm({ nome: '', funcao: 'Porteiro', funcaoOutro: '', valorMensal: '' });
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </FormModal>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card overflow-hidden p-0 rounded-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-sigac-accent/10 to-sigac-accent/5 text-sigac-nav border-b border-slate-200">
                <th className="text-left p-3 font-semibold rounded-tl-2xl">Nome</th>
                <th className="text-left p-3 font-semibold">Função</th>
                <th className="text-right p-3 font-semibold">Valor mensal</th>
                <th className="w-28 p-3 font-semibold rounded-tr-2xl text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {funcionarios.map((funcionario, index) => (
                <motion.tr
                  key={funcionario.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * index }}
                  className={`border-b border-slate-100 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  } hover:bg-sigac-accent/5`}
                >
                  <td className="p-3 font-medium text-slate-800">{funcionario.nome}</td>
                  <td className="p-3 text-slate-600">{funcionario.funcao}</td>
                  <td className="p-3 text-right font-medium text-sigac-nav">
                    R$ {Number(funcionario.valorMensal).toFixed(2).replace('.', ',')}
                  </td>
                  <td className="p-2">
                    <div className="flex items-center justify-end gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="p-2 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors"
                        onClick={() => aoAbrirFormularioFuncionario(funcionario)}
                        title="Editar"
                        aria-label="Editar"
                      >
                        <Pencil className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => setDeletingFuncionarioId(funcionario.id)}
                        title="Excluir"
                        aria-label="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {funcionarios.length === 0 && (
          <p className="p-8 text-slate-500 text-center">
            Nenhum funcionário cadastrado. Clique em <strong>Novo funcionário</strong> para começar.
          </p>
        )}
      </motion.div>

      <ConfirmModal
        open={deletingFuncionarioId !== null}
        onClose={() => setDeletingFuncionarioId(null)}
        onConfirm={async () => {
          if (deletingFuncionarioId !== null) await handleDelete(deletingFuncionarioId);
        }}
        title="Excluir funcionário?"
        description={
          deletingFuncionario
            ? `Ao excluir "${deletingFuncionario.nome}" (${deletingFuncionario.funcao}), o registro será removido permanentemente. Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={submitting}
        loadingLabel="Excluindo..."
      />
    </motion.div>
  );
}
