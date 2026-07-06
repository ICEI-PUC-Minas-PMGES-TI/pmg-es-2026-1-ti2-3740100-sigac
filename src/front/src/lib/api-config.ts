/** URL base da API (sem barra final). Em produção, definida via API_URL na Vercel. */
export function getApiBaseUrl(): string {
  const configured = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');

  if (typeof window !== 'undefined') return '/api-back';
  return 'http://localhost:8080';
}
