# Rastreabilidade — Processos × Telas (UI)

Este documento mapeia as **atividades** descritas nos documentos de **processos (BPMN)** para as **telas do wireframe/UI** descritas em `docs/ui/_ui.md`.

## Como usar

- Use esta tabela para verificar rapidamente se **cada atividade do processo** possui uma **tela correspondente** no wireframe.
- Se uma atividade não tiver tela, marque como **MISSING** e registre na coluna **Observações** qual tela precisa ser criada no wireframe.

## Convenções

- **Referência no UI**: seção do arquivo `docs/ui/_ui.md` (ex.: `UI 2.2`).
- **Status**:
  - **OK**: existe tela no wireframe que cobre a atividade.
  - **PARTIAL**: existe tela, mas não cobre totalmente o que o processo descreve.
  - **MISSING**: não existe tela correspondente no wireframe.

## Tabela de rastreabilidade

| Processo | Atividade | Perfil | Tela (UI) | Referência no UI | Status | Observações |
|---|---|---|---|---|---|---|
| **Processo 1 — Cadastro de Condomínios** (`docs/processo-1-cadastro-de-condominio.md`) | Cadastrar condomínio | Admin | Criação de condomínio (modal) | UI 2.2 | OK | Campos: nome, endereço, CNPJ. Comandos: Salvar/Cancelar. |
