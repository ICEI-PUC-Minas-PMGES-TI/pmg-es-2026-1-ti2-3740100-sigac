# Autenticação e redirecionamento por perfil

Implementar e validar o fluxo de login com autenticação JWT, tratamento de sessão e mensagens claras de erro.
Garantir o redirecionamento automático do usuário para as áreas de administrador, gestor ou síndico conforme seu papel e vínculos.

# Cadastro de condomínios

Permitir ao administrador cadastrar e editar condomínios com nome, endereço e CNPJ em interface própria.
Exibir a listagem dos condomínios cadastrados e preparar a base para associação dos usuários responsáveis por cada unidade.

# Gestão de gestores e síndicos por condomínio

Disponibilizar ao administrador o cadastro, a edição e a remoção de gestores e síndicos vinculados a cada condomínio.
Centralizar a administração de acesso por papel, mantendo a separação entre responsáveis operacionais e responsáveis de acompanhamento.

# Dashboard financeiro do gestor

Consolidar no painel do gestor os totais mensais de arrecadação, funcionários, produtos, manutenções, despesas e saldo.
Apresentar gráficos, tabelas detalhadas por período e visão executiva para apoiar a gestão financeira do condomínio.

# Geração e envio de relatório financeiro

Permitir ao gestor gerar relatório financeiro em PDF com resumo mensal, tabelas de gastos e composição das despesas.
Oferecer o envio desse relatório por e-mail para múltiplos destinatários a partir do próprio dashboard.

# Controle de arrecadação mensal

Registrar o valor arrecadado de cada mês por condomínio, limitando o lançamento ao período selecionado e sem permitir meses futuros.
Manter histórico de alterações com logs de auditoria para consulta posterior sobre quem mudou cada valor e quando.

# Cadastro de funcionários

Permitir ao gestor cadastrar, editar, listar e excluir funcionários com nome, função e valor mensal.
Exibir esses dados no dashboard financeiro e também em visão de consulta para o síndico.

# Cadastro de inquilinos

Permitir ao gestor manter o cadastro de inquilinos com nome e e-mail para comunicação e organização condominial.
Disponibilizar uma visualização de leitura para o síndico e usar os contatos como base para notificações relacionadas a manutenção.

# Lançamento de gastos com produtos

Permitir ao gestor registrar, editar, listar e excluir gastos com produtos, informando descrição, data, valor e fornecedor.
Oferecer filtros por ano e mês, além de refletir esses lançamentos no dashboard e nas consultas do síndico.

# Gestão de manutenções

Permitir ao gestor cadastrar, editar, listar e excluir manutenções com descrição, tipo, prestador, data e valor.
Prever a notificação dos inquilinos e o vínculo com solicitações abertas pelo síndico para fechar o fluxo operacional.

# Solicitações de manutenção pelo síndico

Permitir ao síndico abrir solicitações de manutenção e acompanhar as manutenções já registradas em modo somente leitura.
Exibir a contagem de solicitações pendentes para o gestor e permitir a aprovação operacional por meio da criação da manutenção correspondente.

# Perfil do usuário e alteração de senha

Disponibilizar tela de perfil com nome, e-mail e função do usuário autenticado em qualquer área do sistema.
Permitir a alteração de senha com validação de confirmação e regra mínima de segurança diretamente pela interface.
