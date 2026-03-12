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
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || res.statusText || 'Erro na requisição');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
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
