'use client';

import { useSearchParams } from 'next/navigation';
import { PerfilContent } from '@/components/PerfilContent';

export default function SindicoPerfilPage() {
  const searchParams = useSearchParams();
  const condominioId = searchParams.get('condominioId');
  const backHref = condominioId ? `/sindico?condominioId=${condominioId}` : '/sindico';

  return <PerfilContent backHref={backHref} />;
}
