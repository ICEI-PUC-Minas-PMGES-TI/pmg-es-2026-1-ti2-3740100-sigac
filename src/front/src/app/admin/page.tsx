'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Pencil, Plus, RefreshCw, Trash2, UserCheck, UserCog } from 'lucide-react';
import { api, CondominioDTO, UserDTO } from '@/lib/api';
import { TableSkeleton } from '@/components/LoadingSpinner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { FormModal } from '@/components/FormModal';

type CondominioForm = {
  nome: string;
  endereco: string;
  cnpj: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

const emptyCondominioForm: CondominioForm = {
  nome: '',
  endereco: '',
  cnpj: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
};

function normalizeCnpj(raw: string) {
  return raw.trim().replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
}

function normalizeCep(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 8);
}

function formatCep(raw: string) {
  const digits = normalizeCep(raw);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function buildEnderecoPreview(source: Partial<CondominioForm | CondominioDTO>) {
  const linha1 = [source.logradouro?.trim(), source.numero?.trim()].filter(Boolean).join(', ');
  const linha1ComComplemento = [linha1, source.complemento?.trim()].filter(Boolean).join(' - ');
  const cidadeUf = [source.cidade?.trim(), source.uf?.trim()].filter(Boolean).join('/');
  const linha2 = [source.bairro?.trim(), cidadeUf].filter(Boolean).join(' - ');
  const endereco = [linha1ComComplemento, linha2].filter(Boolean).join(' - ');
  return endereco.trim();
}

function toCondominioForm(condominio: CondominioDTO): CondominioForm {
  return {
    nome: condominio.nome ?? '',
    endereco: condominio.endereco ?? condominio.enderecoCompleto ?? '',
    cnpj: condominio.cnpj ?? '',
    cep: condominio.cep ?? '',
    logradouro: condominio.logradouro ?? '',
    numero: condominio.numero ?? '',
    complemento: condominio.complemento ?? '',
    bairro: condominio.bairro ?? '',
    cidade: condominio.cidade ?? '',
    uf: condominio.uf ?? '',
  };
}

async function buscarCep(cep: string): Promise<ViaCepResponse> {
  const normalized = normalizeCep(cep);
  if (normalized.length !== 8) {
    throw new Error('Informe um CEP com 8 dígitos.');
  }
  const response = await fetch(`https://viacep.com.br/ws/${normalized}/json/`);
  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP agora.');
  }
  const data = (await response.json()) as ViaCepResponse;
  if (data.erro) {
    throw new Error('CEP não encontrado.');
  }
  return data;
}

export default function AdminPage() {
  const [condominios, setCondominios] = useState<CondominioDTO[]>([]);
  const [carregamento, setCarregamento] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [gestores, setGestores] = useState<UserDTO[]>([]);
  const [sindicos, setSindicos] = useState<UserDTO[]>([]);
  const [showFormCond, setShowFormCond] = useState(false);
  const [showFormGestor, setShowFormGestor] = useState(false);
  const [showFormSindico, setShowFormSindico] = useState(false);
  const [formCond, setFormCond] = useState<CondominioForm>(emptyCondominioForm);
  const [formUser, setFormUser] = useState({ nome: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [editingCondominio, setEditingCondominio] = useState<CondominioDTO | null>(null);
  const [editing, setEditing] = useState<{ tipo: 'GESTOR' | 'SINDICO'; user: UserDTO } | null>(null);
  const [editForm, setEditForm] = useState({ nome: '', email: '', novaSenha: '' });
  const [deletingUser, setDeletingUser] = useState<{ tipo: 'GESTOR' | 'SINDICO'; user: UserDTO } | null>(null);
  const [deletingCondominio, setDeletingCondominio] = useState<CondominioDTO | null>(null);

  const selectedCondominio = condominios.find((c) => c.id === selectedId) ?? null;
  const enderecoPreview = buildEnderecoPreview(formCond);

  const loadCondominios = async (preferredId?: number | null) => {
    const list = await api<CondominioDTO[]>('/condominios');
    setCondominios(list);
    setSelectedId((current) => {
      if (preferredId && list.some((item) => item.id === preferredId)) return preferredId;
      if (current && list.some((item) => item.id === current)) return current;
      return null;
    });
    return list;
  };

  useEffect(() => {
    loadCondominios()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Erro ao carregar condomínios.'))
      .finally(() => setCarregamento(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setGestores([]);
      setSindicos([]);
      return;
    }
    api<UserDTO[]>(`/condominios/${selectedId}/gestores`).then(setGestores).catch(() => setGestores([]));
    api<UserDTO[]>(`/condominios/${selectedId}/sindicos`).then(setSindicos).catch(() => setSindicos([]));
  }, [selectedId]);

  const reloadUsers = (condId: number) => {
    api<UserDTO[]>(`/condominios/${condId}/gestores`).then(setGestores);
    api<UserDTO[]>(`/condominios/${condId}/sindicos`).then(setSindicos);
  };

  const openCreateCondominio = () => {
    setEditingCondominio(null);
    setFormCond(emptyCondominioForm);
    setShowFormCond(true);
    setError('');
  };

  const openEditCondominio = (condominio: CondominioDTO) => {
    setEditingCondominio(condominio);
    setFormCond(toCondominioForm(condominio));
    setShowFormCond(true);
    setError('');
  };

  const handleBuscarCep = async () => {
    setError('');
    setBuscandoCep(true);
    try {
      const data = await buscarCep(formCond.cep);
      setFormCond((current) => ({
        ...current,
        cep: normalizeCep(data.cep ?? current.cep),
        logradouro: data.logradouro ?? current.logradouro,
        complemento: current.complemento || data.complemento || '',
        bairro: data.bairro ?? current.bairro,
        cidade: data.localidade ?? current.cidade,
        uf: (data.uf ?? current.uf).toUpperCase(),
      }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar CEP.');
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleSubmitCondominio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        nome: formCond.nome.trim(),
        endereco: formCond.endereco.trim() || enderecoPreview || undefined,
        cnpj: formCond.cnpj.trim() ? normalizeCnpj(formCond.cnpj) : undefined,
        cep: formCond.cep.trim() ? normalizeCep(formCond.cep) : undefined,
        logradouro: formCond.logradouro.trim() || undefined,
        numero: formCond.numero.trim() || undefined,
        complemento: formCond.complemento.trim() || undefined,
        bairro: formCond.bairro.trim() || undefined,
        cidade: formCond.cidade.trim() || undefined,
        uf: formCond.uf.trim().toUpperCase() || undefined,
      };

      if (editingCondominio) {
        const updated = await api<CondominioDTO>(`/condominios/${editingCondominio.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        await loadCondominios(updated.id);
      } else {
        const created = await api<CondominioDTO>('/condominios', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        await loadCondominios(created.id);
      }

      setFormCond(emptyCondominioForm);
      setEditingCondominio(null);
      setShowFormCond(false);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar condomínio.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCondominio = async (condominio: CondominioDTO) => {
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${condominio.id}`, { method: 'DELETE' });
      setDeletingCondominio(null);
      setEditingCondominio((current) => (current?.id === condominio.id ? null : current));
      await loadCondominios(selectedId === condominio.id ? null : selectedId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir condomínio.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateGestor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${selectedId}/gestores`, {
        method: 'POST',
        body: JSON.stringify({
          ...formUser,
          role: 'GESTOR',
        }),
      });
      setFormUser({ nome: '', email: '', password: '' });
      setShowFormGestor(false);
      reloadUsers(selectedId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSindico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setError('');
    setSubmitting(true);
    try {
      await api(`/condominios/${selectedId}/sindicos`, {
        method: 'POST',
        body: JSON.stringify({ ...formUser, role: 'SINDICO' }),
      });
      setFormUser({ nome: '', email: '', password: '' });
      setShowFormSindico(false);
      reloadUsers(selectedId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditUser = (tipo: 'GESTOR' | 'SINDICO', user: UserDTO) => {
    setEditing({ tipo, user });
    setEditForm({ nome: user.nome, email: user.email, novaSenha: '' });
    setError('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !editing) return;
    setError('');
    setSubmitting(true);
    try {
      const pathRole = editing.tipo === 'GESTOR' ? 'gestores' : 'sindicos';
      const payload: { nome: string; email: string; novaSenha?: string } = {
        nome: editForm.nome,
        email: editForm.email,
      };
      if (editForm.novaSenha.trim()) payload.novaSenha = editForm.novaSenha;
      await api(`/condominios/${selectedId}/${pathRole}/${editing.user.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setEditing(null);
      reloadUsers(selectedId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (tipo: 'GESTOR' | 'SINDICO', user: UserDTO) => {
    if (!selectedId) return;
    setError('');
    setSubmitting(true);
    try {
      const pathRole = tipo === 'GESTOR' ? 'gestores' : 'sindicos';
      await api(`/condominios/${selectedId}/${pathRole}/${user.id}`, {
        method: 'DELETE',
      });
      if (editing && editing.user.id === user.id) {
        setEditing(null);
      }
      setDeletingUser(null);
      reloadUsers(selectedId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao remover usuário');
    } finally {
      setSubmitting(false);
    }
  };

  if (carregamento) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton rounded-lg" />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-sigac-nav flex items-center gap-2">
          <Building2 className="w-8 h-8 text-sigac-accent" />
          Condomínios
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateCondominio}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo condomínio
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
        open={showFormCond}
        onClose={() => {
          setShowFormCond(false);
          setEditingCondominio(null);
        }}
        title={editingCondominio ? 'Editar condomínio' : 'Criar condomínio'}
        icon={<Building2 className="w-5 h-5 text-sigac-accent" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitCondominio} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
              <input
                className="input"
                placeholder="Nome do condomínio"
                value={formCond.nome}
                onChange={(e) => setFormCond((current) => ({ ...current, nome: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
              <input
                className="input"
                placeholder="14 caracteres"
                value={formCond.cnpj}
                onChange={(e) => setFormCond((current) => ({ ...current, cnpj: e.target.value.toUpperCase() }))}
                inputMode="text"
                autoCapitalize="characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="00000-000"
                  value={formatCep(formCond.cep)}
                  onChange={(e) => setFormCond((current) => ({ ...current, cep: normalizeCep(e.target.value) }))}
                  onBlur={() => {
                    if (normalizeCep(formCond.cep).length === 8) void handleBuscarCep();
                  }}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className="btn-secondary whitespace-nowrap inline-flex items-center gap-2"
                  onClick={() => void handleBuscarCep()}
                  disabled={buscandoCep}
                >
                  <RefreshCw className={`w-4 h-4 ${buscandoCep ? 'animate-spin' : ''}`} />
                  CEP
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Logradouro</label>
              <input
                className="input"
                placeholder="Rua, avenida..."
                value={formCond.logradouro}
                onChange={(e) => setFormCond((current) => ({ ...current, logradouro: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
              <input
                className="input"
                placeholder="Número"
                value={formCond.numero}
                onChange={(e) => setFormCond((current) => ({ ...current, numero: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Complemento</label>
              <input
                className="input"
                placeholder="Bloco, torre, referência..."
                value={formCond.complemento}
                onChange={(e) => setFormCond((current) => ({ ...current, complemento: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
              <input
                className="input"
                placeholder="Bairro"
                value={formCond.bairro}
                onChange={(e) => setFormCond((current) => ({ ...current, bairro: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
              <input
                className="input"
                placeholder="Cidade"
                value={formCond.cidade}
                onChange={(e) => setFormCond((current) => ({ ...current, cidade: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">UF</label>
              <input
                className="input"
                placeholder="UF"
                maxLength={2}
                value={formCond.uf}
                onChange={(e) => setFormCond((current) => ({ ...current, uf: e.target.value.toUpperCase() }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Endereço completo</label>
              <textarea
                className="input min-h-24 resize-y"
                placeholder="Se deixar em branco, o sistema monta a partir dos campos acima."
                value={formCond.endereco}
                onChange={(e) => setFormCond((current) => ({ ...current, endereco: e.target.value }))}
              />
              {enderecoPreview && (
                <p className="mt-2 text-xs text-slate-500">
                  Prévia automática: {enderecoPreview}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : editingCondominio ? 'Salvar alterações' : 'Criar'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowFormCond(false);
                setEditingCondominio(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </FormModal>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="card"
        >
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sigac-accent" />
            Lista de condomínios
          </h2>
          <ul className="space-y-2">
            {condominios.map((c, i) => {
              const endereco = c.enderecoCompleto || c.endereco || buildEnderecoPreview(c);
              return (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedId === c.id
                      ? 'border-sigac-accent bg-sigac-accent/10 shadow-sm'
                      : 'border-sigac-border hover:bg-slate-50 hover:border-slate-200'
                  }`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <span className="font-medium text-slate-800">{c.nome}</span>
                  {endereco && <span className="block text-sm text-slate-500 mt-0.5">{endereco}</span>}
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        {selectedCondominio && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="card space-y-5"
          >
            <section className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-sigac-accent" />
                    Dados do condomínio
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{selectedCondominio.nome}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-secondary inline-flex items-center gap-2"
                    onClick={() => openEditCondominio(selectedCondominio)}
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-danger inline-flex items-center gap-2"
                    onClick={() => setDeletingCondominio(selectedCondominio)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700 space-y-2">
                <p><span className="font-medium text-slate-900">CNPJ:</span> {selectedCondominio.cnpj || '—'}</p>
                <p><span className="font-medium text-slate-900">CEP:</span> {selectedCondominio.cep ? formatCep(selectedCondominio.cep) : '—'}</p>
                <p><span className="font-medium text-slate-900">Logradouro:</span> {selectedCondominio.logradouro || '—'}</p>
                <p><span className="font-medium text-slate-900">Número:</span> {selectedCondominio.numero || '—'}</p>
                <p><span className="font-medium text-slate-900">Complemento:</span> {selectedCondominio.complemento || '—'}</p>
                <p><span className="font-medium text-slate-900">Bairro:</span> {selectedCondominio.bairro || '—'}</p>
                <p><span className="font-medium text-slate-900">Cidade/UF:</span> {[selectedCondominio.cidade, selectedCondominio.uf].filter(Boolean).join('/') || '—'}</p>
                <p><span className="font-medium text-slate-900">Endereço completo:</span> {selectedCondominio.enderecoCompleto || selectedCondominio.endereco || buildEnderecoPreview(selectedCondominio) || '—'}</p>
              </div>
            </section>

            <section>
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-sigac-accent" />
                Gestores e síndicos
              </h2>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setShowFormGestor(true);
                    setShowFormSindico(false);
                    setError('');
                  }}
                  className="btn-primary text-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Gestor
                </button>
                <button
                  onClick={() => {
                    setShowFormSindico(true);
                    setShowFormGestor(false);
                    setError('');
                  }}
                  className="btn-secondary text-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Síndico
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                  <UserCog className="w-4 h-4" /> Gestores
                </p>
                {gestores.length === 0 ? (
                  <p className="text-sm text-slate-400 pl-5">Nenhum gestor cadastrado.</p>
                ) : (
                  gestores.map((g) => (
                    <div key={g.id} className="flex items-center justify-between text-sm border-b border-slate-100 py-2 pl-5">
                      <span className="text-slate-700">{g.nome} — {g.email}</span>
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          className="p-2 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors"
                          onClick={() => startEditUser('GESTOR', g)}
                          title="Editar"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => setDeletingUser({ tipo: 'GESTOR', user: g })}
                          title="Remover"
                          aria-label="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  ))
                )}
                <p className="text-sm font-medium text-slate-600 mt-3 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> Síndicos
                </p>
                {sindicos.length === 0 ? (
                  <p className="text-sm text-slate-400 pl-5">Nenhum síndico cadastrado.</p>
                ) : (
                  sindicos.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm border-b border-slate-100 py-2 pl-5">
                      <span className="text-slate-700">{s.nome} — {s.email}</span>
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          className="p-2 rounded-lg text-sigac-nav hover:bg-sigac-accent/10 hover:text-sigac-accent transition-colors"
                          onClick={() => startEditUser('SINDICO', s)}
                          title="Editar"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => setDeletingUser({ tipo: 'SINDICO', user: s })}
                          title="Remover"
                          aria-label="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </motion.div>
        )}
      </div>

      <FormModal
        open={showFormGestor}
        onClose={() => setShowFormGestor(false)}
        title="Novo gestor"
        icon={<UserCog className="w-5 h-5 text-sigac-accent" />}
      >
        <form onSubmit={handleCreateGestor} className="space-y-3">
          <input className="input" placeholder="Nome" value={formUser.nome} onChange={(e) => setFormUser((f) => ({ ...f, nome: e.target.value }))} required />
          <input type="email" className="input" placeholder="E-mail" value={formUser.email} onChange={(e) => setFormUser((f) => ({ ...f, email: e.target.value }))} required />
          <input type="password" className="input" placeholder="Senha" value={formUser.password} onChange={(e) => setFormUser((f) => ({ ...f, password: e.target.value }))} required />
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary" disabled={submitting}>Criar gestor</button>
            <button type="button" className="btn-secondary" onClick={() => setShowFormGestor(false)}>Cancelar</button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={showFormSindico}
        onClose={() => setShowFormSindico(false)}
        title="Novo síndico"
        icon={<UserCheck className="w-5 h-5 text-sigac-accent" />}
      >
        <form onSubmit={handleCreateSindico} className="space-y-3">
          <input className="input" placeholder="Nome" value={formUser.nome} onChange={(e) => setFormUser((f) => ({ ...f, nome: e.target.value }))} required />
          <input type="email" className="input" placeholder="E-mail" value={formUser.email} onChange={(e) => setFormUser((f) => ({ ...f, email: e.target.value }))} required />
          <input type="password" className="input" placeholder="Senha" value={formUser.password} onChange={(e) => setFormUser((f) => ({ ...f, password: e.target.value }))} required />
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary" disabled={submitting}>Criar síndico</button>
            <button type="button" className="btn-secondary" onClick={() => setShowFormSindico(false)}>Cancelar</button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Editar ${editing.tipo === 'GESTOR' ? 'gestor' : 'síndico'}` : ''}
        icon={<Pencil className="w-5 h-5 text-sigac-accent" />}
      >
        {editing && (
          <form onSubmit={handleUpdateUser} className="space-y-3">
            <input className="input" placeholder="Nome" value={editForm.nome} onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))} required />
            <input type="email" className="input" placeholder="E-mail" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} required />
            <div>
              <label className="text-sm text-slate-600 block mb-1">Nova senha (opcional)</label>
              <input type="text" className="input" placeholder="Deixe em branco para não alterar" value={editForm.novaSenha} onChange={(e) => setEditForm((f) => ({ ...f, novaSenha: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar alterações'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </form>
        )}
      </FormModal>

      <ConfirmModal
        open={deletingUser !== null}
        onClose={() => setDeletingUser(null)}
        onConfirm={async () => { if (deletingUser) await handleDeleteUser(deletingUser.tipo, deletingUser.user); }}
        title={deletingUser ? `Remover ${deletingUser.tipo === 'GESTOR' ? 'gestor' : 'síndico'}?` : ''}
        description={
          deletingUser
            ? `${deletingUser.user.nome} (${deletingUser.user.email}) será removido do condomínio. Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Sim, remover"
        cancelLabel="Cancelar"
        variant="danger"
        loading={submitting}
        loadingLabel="Removendo..."
      />

      <ConfirmModal
        open={deletingCondominio !== null}
        onClose={() => setDeletingCondominio(null)}
        onConfirm={async () => { if (deletingCondominio) await handleDeleteCondominio(deletingCondominio); }}
        title={deletingCondominio ? `Excluir ${deletingCondominio.nome}?` : ''}
        description={
          deletingCondominio
            ? 'O condomínio será removido com seus registros vinculados. Gestores e síndicos sem outro vínculo também serão apagados.'
            : ''
        }
        confirmLabel="Sim, excluir condomínio"
        cancelLabel="Cancelar"
        variant="danger"
        loading={submitting}
        loadingLabel="Excluindo..."
      />
    </motion.div>
  );
}
