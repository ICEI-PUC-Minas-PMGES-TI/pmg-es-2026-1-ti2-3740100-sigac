import type { CondominioDTO } from '@/lib/api';

/** IDs que o JWT diz que o usuário pode enxergar (gestor/síndico). */
export function resolveCondominioIdForNav(
  list: CondominioDTO[],
  urlParam: string | null,
  allowedIds: number[] | undefined
): number | null {
  const allowed = allowedIds ?? [];
  const urlId = urlParam ? Number(urlParam) : NaN;
  const urlOk = Number.isFinite(urlId) && allowed.includes(urlId);

  if (list.length > 0) {
    if (urlOk && list.some((c) => c.id === urlId)) return urlId;
    const firstOverlap = list.find((c) => allowed.includes(c.id));
    return firstOverlap?.id ?? list[0].id;
  }

  /** Lista da API falhou ou veio vazia: mantém navegação com o que já sabemos pelo login ou pela URL válida */
  if (urlOk) return urlId;
  return allowed.length ? allowed[0] : null;
}
