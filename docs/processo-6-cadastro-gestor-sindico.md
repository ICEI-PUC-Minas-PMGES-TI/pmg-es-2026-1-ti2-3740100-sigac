### 3.3.6 Processo 6 – Cadastro de Gestor/Síndico

**Nome do Processo:** Cadastro e Vinculação de Gestor e Síndico ao Condomínio

![Cadastro de Gestor/Síndico](images/cadastrogestorsindico.png)

**Observação de alinhamento com UI:** No wireframe (`docs/ui/_ui.md`), as ações de administração relacionadas a usuários do condomínio (como **vincular gestores/síndicos**) costumam aparecer como parte do fluxo de administração do condomínio (itens 2.3+). Como o wireframe não detalha uma tela específica para este cadastro, este processo foi modelado no mesmo padrão dos processos anteriores, propondo um formulário/modal de **Cadastro de Usuário / Vincular ao condomínio**.

**Oportunidades de melhoria:**

  * **Convite por e-mail com ativação:** Em vez de cadastrar senha manualmente, enviar convite (link com expiração) para o Gestor/Síndico definir a própria senha e aceitar os termos.
  * **Controle de permissões por perfil:** Além de “Gestor” e “Síndico”, permitir permissões granulares (ex.: financeiro, manutenção, comunicação) para atender condomínios maiores.
  * **Auditoria de alterações:** Registrar log (quem vinculou, quando, qual perfil, IP) para rastreabilidade.

#### Detalhamento das atividades

**Selecionar condomínio (Admin)**

> Corresponde à seleção de um condomínio na lista da **Página inicial do administrador** (UI 2.1) e acesso às ações de gestão do condomínio.

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| condominio	nome | Seleção única / item de lista | Obrigatório | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Gerenciar usuários do condomínio | Atividade "Cadastrar/Vincular usuário (Gestor/Síndico)" | default |
| Voltar | Lista de condomínios | cancel |

**Cadastrar/Vincular usuário (Gestor/Síndico) (Admin)**

> **Alinhamento com UI:** **A definir no wireframe.** Recomenda-se criar um modal/tela no fluxo do Admin em `docs/ui/_ui.md` (ex.: **"Gerenciar usuários do condomínio"**), com opção de adicionar usuário e escolher o perfil.

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| nome | Caixa de texto | Obrigatório, máximo de 100 caracteres | |
| email | Caixa de texto | Obrigatório, formato de e-mail, deve ser único no sistema | |
| cpf | Caixa de texto | Opcional, formato CPF (XXX.XXX.XXX-XX) | |
| telefone | Caixa de texto | Opcional | |
| perfil | Seleção única | Obrigatório (Gestor, Síndico) | Gestor |
| unidade	referencia | Caixa de texto / Seleção | Obrigatório se perfil = Síndico (ex.: Bloco A / Apto 101) | |
| data	iinicio	do	habilitacao | Data | Opcional | Data atual |
| enviar	convite | Seleção única | Opcional (Sim/Não) | Sim |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Salvar | Retorna para listagem de usuários vinculados ao condomínio | default |
| Cancelar | Retorna para a tela anterior sem alterações | cancel |

**Listar usuários vinculados (Admin)**

> Lista os usuários já associados ao condomínio e permite ações de manutenção do vínculo.

| **Dados exibidos (tabela)** | **Tipo** | **Observações** |
| --- | --- | --- |
| nome | Texto | Somente leitura |
| email | Texto | Somente leitura |
| perfil | Texto | Gestor ou Síndico |
| unidade	referencia | Texto | Exibir quando aplicável |
| status | Texto | Ativo / Pendente (convite) / Inativo |
| acoes | Botões/ícones | Editar / Desvincular / Reenviar convite |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Novo usuário | Atividade "Cadastrar/Vincular usuário (Gestor/Síndico)" | default |
| Editar (linha) | Atividade "Editar vínculo/usuário" | default |
| Desvincular (linha) | Confirmação de desvinculação | cancel |
| Reenviar convite (linha) | Envio de novo convite por e-mail | default |

**Editar vínculo/usuário (Admin)**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| nome | Caixa de texto | Obrigatório, máximo de 100 caracteres | (pré-preenchido) |
| email | Caixa de texto | Obrigatório, formato de e-mail | (pré-preenchido) |
| telefone | Caixa de texto | Opcional | (pré-preenchido) |
| perfil | Seleção única | Obrigatório (Gestor, Síndico) | (pré-preenchido) |
| unidade	referencia | Caixa de texto / Seleção | Obrigatório se perfil = Síndico | (pré-preenchido) |
| status | Seleção única | Obrigatório (Ativo, Pendente, Inativo) | Ativo |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Salvar alterações | Retorna para listagem de usuários vinculados | default |
| Cancelar | Retorna para listagem sem alterações | cancel |

**Desvincular usuário do condomínio (Admin)**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| usuario | Somente leitura | Exibe nome/e-mail e perfil | |
| motivo | Caixa de texto | Opcional, máximo de 200 caracteres | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Confirmar desvinculação | Retorna para listagem com usuário removido do condomínio | default |
| Cancelar | Retorna para listagem sem alterações | cancel |

**Resultado esperado**

- Gestor e/ou Síndico cadastrados e vinculados ao condomínio.
- Caso **enviar convite = Sim**, usuário fica com status **Pendente** até concluir ativação.
- Admin consegue manter o vínculo (editar/desvincular) e acompanhar status.
