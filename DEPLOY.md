# Deploy SIGAC — Vercel (front) + Render (back)

## Credenciais admin (fixas)

| Campo | Valor |
|-------|--------|
| E-mail | `admin@sigac.com` |
| Senha | `admin123` |

O backend recria/garante esse usuário ao subir em produção (`SIGAC_ADMIN_ENSURE_CREDENTIALS=true`).

---

## Passo A — Front na Vercel (faça primeiro)

1. Acesse [vercel.com](https://vercel.com) e importe o repositório GitHub.
2. Em **Root Directory**, defina: `src/front`
3. Framework: **Next.js** (detectado automaticamente).
4. **Não** configure `API_URL` ainda — o build deve passar sem ela.
5. Clique em **Deploy** e aguarde.
6. Copie a URL gerada, por exemplo: `https://sigac-xxxx.vercel.app`

---

## Passo B — Back no Render (blueprint)

1. No [Render Dashboard](https://dashboard.render.com) → **Blueprints** → **New Blueprint Instance**.
2. Conecte o mesmo repositório.
3. Antes de aplicar, edite `render.yaml` na raiz do repo:
   - Em `SIGAC_CORS_ALLOWED_ORIGINS`, troque `https://SUBSTITUA-URL-DO-VERCEL.vercel.app` pela URL real do passo A.
4. Aplique o blueprint. Serão criados:
   - Banco PostgreSQL `sigac-db`
   - Web Service `sigac-api` (Docker + Spring Boot / Java 17)
5. Aguarde o deploy e copie a URL do serviço, por exemplo: `https://sigac-api.onrender.com`
6. Teste: `https://sigac-api.onrender.com/health` deve retornar `{"status":"ok"}`.

---

## Passo C — Ligar front ao back

1. Na Vercel: **Project → Settings → Environment Variables**
2. Adicione (Production, Preview e Development se quiser):

   | Nome | Valor |
   |------|--------|
   | `API_URL` | `https://sigac-api.onrender.com` (sua URL do Render, sem `/` no final) |

3. **Redeploy** o projeto na Vercel (Deployments → ⋯ → Redeploy).
4. Abra o front, faça login com `admin@sigac.com` / `admin123`.

---

## Desenvolvimento local

```bash
# Terminal 1 — back
cd src/back
mvn spring-boot:run

# Terminal 2 — front
cd src/front
npm install
npm run dev
```

O front usa proxy `/api-back` → `http://localhost:8080` automaticamente.

---

## Variáveis de ambiente (referência)

### Vercel (front)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `API_URL` | Sim (produção) | URL pública do backend Render |

### Render (back)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Perfil de produção |
| `SIGAC_CORS_ALLOWED_ORIGINS` | — | URL do front na Vercel |
| `SIGAC_ADMIN_EMAIL` | `admin@sigac.com` | Admin fixo |
| `SIGAC_ADMIN_PASSWORD` | `admin123` | Senha admin fixa |
| `JWT_SECRET` | gerado | Segredo JWT |
| `DATABASE_URL` | do Postgres | Injetado pelo Render |
| `MAIL_*` | opcional | SMTP para e-mails |

---

## Observações

- O plano **free** do Render pode colocar o back em sleep; a primeira requisição após inatividade pode demorar ~30–60s.
- Dados de demonstração: com o back rodando localmente, use `node scripts/seed.js` em `src/back` (ver README principal).
