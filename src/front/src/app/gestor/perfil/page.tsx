'use client';

import { useSearchParams } from 'next/navigation';
import { PerfilContent } from '@/components/PerfilContent';

export default function GestorPerfilPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const backHref = condominioId ? `/gestor?condominioId=${condominioId}` : '/gestor';

  return <PerfilContent backHref={backHref} />;
}
