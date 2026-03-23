const API_BASE = typeof window !== 'undefined' ? '/api-back' : 'http://localhost:8080/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sigac_token');
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    const msg = data?.message;
    // Mensagens claras para o usuário (evitar "Forbidden", "Unauthorized", etc.)
    if (msg && !/forbidden|unauthorized/i.test(msg)) throw new Error(msg);
    if (res.status === 401) throw new Error('Sessão expirada ou acesso negado. Faça login novamente.');
    if (res.status === 403) throw new Error('Você não tem permissão para esta ação.');
    if (res.status === 404) throw new Error('Registro não encontrado.');
    if (res.status >= 500) throw new Error('Erro no servidor. Tente novamente em alguns instantes.');
    throw new Error('Algo deu errado. Tente novamente.');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** POST multipart (sem Content-Type manual; o browser define o boundary). */
export async function apiFormData<T = { message: string }>(
  path: string,
  formData: FormData
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', body: formData, headers });
  const data = (await res.json().catch(() => ({}))) as { message?: string };
  if (!res.ok) {
    const msg = data?.message;
    if (msg && !/forbidden|unauthorized/i.test(msg)) throw new Error(msg);
    if (res.status === 401) throw new Error('Sessão expirada ou acesso negado. Faça login novamente.');
    if (res.status === 403) throw new Error('Você não tem permissão para esta ação.');
    if (res.status === 404) throw new Error('Registro não encontrado.');
    if (res.status >= 500) throw new Error(msg || 'Erro no servidor. Tente novamente em alguns instantes.');
    throw new Error(msg || 'Algo deu errado. Tente novamente.');
  }
  return data as T;
}

export type Role = 'SIGAC_ADMIN' | 'GESTOR' | 'SINDICO';

export interface AuthResponse {
  token: string;
  email: string;
  nome: string;
  role: Role;
  userId: number;
  condominioIds: number[];
}

export interface CondominioDTO {
  id: number;
  nome: string;
  endereco?: string;
  cnpj?: string;
}

export interface FuncionarioDTO {
  id: number;
  nome: string;
  funcao: string;
  valorMensal: number;
  condominioId: number;
}

export interface InquilinoDTO {
  id: number;
  nome: string;
  email: string;
  condominioId: number;
}

export interface GastoProdutoDTO {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  lojaFornecedor?: string;
  condominioId: number;
}

export interface ManutencaoDTO {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  tipo: 'PREVISTA' | 'EMERGENCIAL';
  prestador?: string;
  instrucoesEmail?: string;
  condominioId: number;
  /** Opcional no cadastro: vincula à fila do síndico e remove a solicitação após criar. */
  solicitacaoId?: number | null;
}

export interface SolicitacaoManutencaoDTO {
  id: number;
  titulo: string;
  condominioId: number;
  solicitanteNome: string;
  criadoEm: string;
}

export interface SolicitacaoManutencaoContagemDTO {
  total: number;
}

export interface ManutencaoResumoDTO {
  id: number;
  descricao: string;
  data: string;
  valor: number;
  tipo: 'PREVISTA' | 'EMERGENCIAL';
  prestador?: string;
}

export interface FuncionarioResumoDTO {
  id: number;
  nome: string;
  funcao: string;
  valorMensal: number;
}

export interface GastoProdutoResumoDTO {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  lojaFornecedor?: string;
}

export interface DashboardGastosDTO {
  condominioId: number;
  nomeCondominio: string;
  mesAno: { year: number; month: number };
  totalFuncionarios: number;
  totalProdutos: number;
  totalManutencoes: number;
  totalGeral: number;
  itens: { categoria: string; valor: number }[];
  manutencoesDoMes: ManutencaoResumoDTO[];
  funcionarios: FuncionarioResumoDTO[];
  gastosProdutosDoMes: GastoProdutoResumoDTO[];
}

export interface UserDTO {
  id: number;
  nome: string;
  email: string;
  role: Role;
}
