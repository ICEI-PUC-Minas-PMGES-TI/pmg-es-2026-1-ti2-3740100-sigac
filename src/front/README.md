# SIGAC – Frontend

Interface do SIGAC em Next.js 14 (App Router), TypeScript e Tailwind.

## Executar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. O proxy (`next.config.js`) envia requisições de `/api-back` para o backend em `http://localhost:8080/api`.

## Login padrão

- **Admin:** `admin@sigac.com` / `admin123`

Após login, o redirecionamento é por perfil: Admin → `/admin`, Gestor → `/gestor`, Síndico → `/sindico`.

## Estrutura

- `src/app/` – Páginas (login, admin, gestor, sindico)
- `src/contexts/AuthContext.tsx` – Autenticação e estado do usuário
- `src/lib/api.ts` – Cliente HTTP e tipos
