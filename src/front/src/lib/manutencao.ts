import { CategoriaManutencao, TipoManutencao } from '@/lib/api';

export const categoriasManutencao: CategoriaManutencao[] = [
  'JARDINAGEM',
  'ELETRICA',
  'HIDRAULICA',
  'ELEVADOR',
  'PINTURA',
  'LIMPEZA',
  'SEGURANCA',
  'ESTRUTURAL',
  'PISCINA',
  'OUTROS',
];

const categoriaLabels: Record<CategoriaManutencao, string> = {
  JARDINAGEM: 'Jardinagem',
  ELETRICA: 'Elétrica',
  HIDRAULICA: 'Hidráulica',
  ELEVADOR: 'Elevador',
  PINTURA: 'Pintura',
  LIMPEZA: 'Limpeza',
  SEGURANCA: 'Segurança',
  ESTRUTURAL: 'Estrutural',
  PISCINA: 'Piscina',
  OUTROS: 'Outros',
};

const tipoLabels: Record<TipoManutencao, string> = {
  PREVISTA: 'Prevista',
  EMERGENCIAL: 'Emergencial',
};

export function getCategoriaManutencaoLabel(categoria?: CategoriaManutencao | null) {
  return categoria ? categoriaLabels[categoria] : 'Outros';
}

export function getTipoManutencaoLabel(tipo: TipoManutencao) {
  return tipoLabels[tipo];
}
