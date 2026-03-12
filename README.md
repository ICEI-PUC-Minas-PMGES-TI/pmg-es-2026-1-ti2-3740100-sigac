# SIGAC - Sistema Integrado de Gestão e Administração Condominial

Sistema web para gestão condominial com três perfis de acesso: **SIGAC Admin**, **Gestor do condomínio** e **Síndico**.

## Estrutura do projeto

```
src/
  back/          – API REST (Java, Spring Boot 3, JWT, JPA, H2/MySQL)
  front/         – Interface web (Next.js 14, App Router, Tailwind, Recharts)
```

O backend usa o pacote `sigac` (código em `src/back/src/main/java/sigac/`).

## Papéis de acesso

| Papel | Descrição |
|-------|-----------|
| **SIGAC Admin** | Cria condomínios e os gestores/síndicos de cada condomínio. |
| **Gestor do condomínio** | Cadastra funcionários (com valor mensal), inquilinos (nome e e-mail), gastos com produtos, manutenções (previstas/emergenciais). Ao cadastrar manutenção, o sistema envia e-mail aos inquilinos. Acesso a dashboard de gastos mensais. |
| **Síndico** | Apenas visualiza gastos, funcionários, inquilinos e manutenções (somente leitura). |

Inquilinos **não acessam o sistema**; recebem apenas e-mails quando uma manutenção é programada.

## Como rodar

### Backend (Java)

```bash
cd src/back
mvn spring-boot:run
```

A API sobe em `http://localhost:8080`. Banco H2 em memória (console em `/h2-console`).

**Usuário admin padrão:** `admin@sigac.com` / `admin123`

### Frontend (Next.js)

```bash
cd src/front
npm install
npm run dev
```

Acesse `http://localhost:3000`. O proxy envia chamadas `/api-back/*` para o backend.

### E-mail (opcional)

Para envio de e-mails de manutenção aos inquilinos, configure em `src/back` (variáveis de ambiente ou `application.yml`):

- `MAIL_USERNAME`, `MAIL_PASSWORD` (ex.: Gmail com "senha de app")
- `MAIL_HOST`, `MAIL_PORT` (padrão: smtp.gmail.com, 587)

Sem configuração, o envio é apenas logado.

## Funcionalidades

- **Admin:** criar condomínio; criar gestor e síndico por condomínio (usuário + vínculo).
- **Gestor:** dashboard de gastos (funcionários + produtos + manutenções por mês); CRUD de funcionários (função e valor mensal); CRUD de inquilinos (nome e e-mail); registrar gastos com produtos (descrição opcional, valor, data, loja); cadastrar manutenções (data, tipo prevista/emergencial, prestador, instruções no e-mail) com envio de e-mail aos inquilinos.
- **Síndico:** visualização de dashboard e listas (sem criar/editar/excluir).
- Relatório de gastos mensais: soma de funcionários (valor mensal fixo) + produtos + manutenções no mês.

## Tecnologias

- **Back:** Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, H2/MySQL, Spring Mail
- **Front:** Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts
