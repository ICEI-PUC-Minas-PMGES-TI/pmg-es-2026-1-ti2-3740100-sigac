# Relatório de Detalhamento das Atividades — SIGAC

## Introdução

Este relatório consolida todas as tarefas de usuário dos 5 processos BPMN do **Sistema Integrado de Gestão e Administração Condominial (SIGAC)**. Para cada processo, são apresentados: a identificação das tarefas e seus atores responsáveis, os campos de cada tarefa de usuário (com tipo, restrições e valor default) e os comandos disponíveis (com destino e tipo). Ao final, é apresentado o modelo de dados relacional que suporta todos os processos.

**Total de processos:** 5
**Total de tarefas de usuário:** 22

---

## Processo 1 — Cadastro de Condomínios

[Diagrama BPMN - Processo 1](https://github.com/ICEI-PUC-Minas-PMGES-TI/pmg-es-2026-1-ti2-3740100-sigac/blob/main/docs/processo-1-cadastro-de-condominio.md)

### Identificação das Tarefas

| # | Tarefa | Ator Responsável |
|---|--------|-----------------|
| 1 | Preencher formulário | Gestora |
| 2 | Validar cadastro | Dep. Cadastro |
| 3 | Solicitar correções | Dep. Cadastro |
| 4 | Ativar registro e acesso | Dep. Cadastro |

### Detalhamento dos Campos e Comandos

#### Tarefa 1.1 — Preencher formulário

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| nome_condominio | Caixa de texto | Obrigatório, máximo de 100 caracteres | |
| cnpj | Caixa de texto | Opcional | |
| qtd_unidades | Número | Obrigatório, valor > 0 | 1 |
| tipo_condominio | Seleção única | Obrigatório (Residencial, Comercial, Misto) | Residencial |
| nome_sindico | Caixa de texto | Obrigatório | |
| email_contato | Caixa de texto | Obrigatório, formato de e-mail | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Salvar e Avançar | Atividade "Validar cadastro" | default |
| Cancelar | Fim do Processo (Cancelamento) | cancel |

---

#### Tarefa 1.2 — Validar cadastro

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| dados_formulario | Tabela | Somente leitura (Exibe dados preenchidos) | |
| parecer_analise | Área de texto | Obrigatório caso o cadastro seja rejeitado | |
| status_aprovacao | Seleção única | Obrigatório (Aprovado, Rejeitado) | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Confirmar Análise | Gateway "Cadastro validado?" | default |
| Salvar Rascunho | Própria atividade (Validar cadastro) | |

---

#### Tarefa 1.3 — Solicitar correções

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| motivo_rejeicao | Área de texto | Obrigatório, preenchido na validação | Parecer da análise |
| orientacoes_correcao | Área de texto | Obrigatório, máximo de 1000 caracteres | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Enviar Notificação | Atividade "Receber e-mail de pendência" | default |
| Cancelar | Atividade "Validar cadastro" | cancel |

---

#### Tarefa 1.4 — Ativar registro e acesso

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| id_sistema_condominio | Número | Gerado automaticamente, somente leitura | |
| data_hora_ativacao | Data e Hora | Somente leitura | Data/Hora atual |
| plano_contratado | Seleção única | Obrigatório (Básico, Intermediário, Pro) | Básico |
| enviar_credenciais | Seleção múltipla | Marcar para enviar e-mail com senha | Selecionado |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Concluir Ativação | Fim do Processo | default |
| Voltar | Atividade "Validar cadastro" | |

---

## Processo 2 — Cadastro de Funcionários (Prestadores de Serviço)

[Diagrama BPMN - Processo 2](https://github.com/ICEI-PUC-Minas-PMGES-TI/pmg-es-2026-1-ti2-3740100-sigac/blob/main/docs/processo-2-cadastro-de-funcion%C3%A1rios.md)

### Identificação das Tarefas

| # | Tarefa | Ator Responsável |
|---|--------|-----------------|
| 1 | Cadastrar dados do prestador | Gestora |
| 2 | Editar dados do prestador | Gestora |
| 3 | Visualizar histórico | Síndico |

### Detalhamento dos Campos e Comandos

#### Tarefa 2.1 — Cadastrar dados do prestador

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| nome_completo | Caixa de texto | Obrigatório, máximo de 100 caracteres | |
| cpf_cnpj | Caixa de texto | Obrigatório, formato de CPF ou CNPJ | |
| especialidade | Seleção única | Obrigatório (Ex: Elétrica, Limpeza, Hidráulica) | Manutenção Geral |
| telefone_contato | Caixa de texto | Obrigatório, formato (XX) XXXXX-XXXX | |
| data_contratacao | Data | Não pode ser data futura | |
| contrato_prestacao | Arquivo | Opcional, formatos permitidos: PDF, máx 5MB | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Salvar e Continuar | Atividade "Editar dados do prestador" | default |
| Cancelar | Fim do Processo | cancel |

---

#### Tarefa 2.2 — Editar dados do prestador

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| status_cadastro | Seleção única | Obrigatório (Ativo, Inativo, Suspenso) | Ativo |
| avaliacao_servico | Número | De 1 a 5 | 5 |
| foto_prestador | Imagem | Opcional, formatos permitidos: JPG, PNG, máx 2MB | |
| observacoes_gestor | Área de texto | Opcional, máximo de 500 caracteres | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Atualizar Dados | Atividade "Visualizar histórico" (Síndico) | default |
| Voltar | Atividade "Cadastrar dados do prestador" | |

---

#### Tarefa 2.3 — Visualizar histórico

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| dados_cadastrais | Área de texto | Somente leitura (Exibe o resumo do cadastro) | |
| historico_servicos | Tabela | Somente leitura (Lista de serviços prestados e datas) | |
| data_hora_consulta | Data e Hora | Somente leitura, gerado pelo sistema | Data/Hora atual |
| link_pasta_nuvem | Link | URL para a pasta com documentos físicos escaneados | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Concluir | Fim do Processo | default |
| Imprimir Histórico | Própria atividade (Gera PDF do histórico) | |

---

## Processo 3 — Gestão de Manutenção

[Diagrama BPMN - Processo 3](https://github.com/ICEI-PUC-Minas-PMGES-TI/pmg-es-2026-1-ti2-3740100-sigac/blob/main/docs/processo-3-gest%C3%A3o-de-manuten%C3%A7%C3%A3o.md)

### Identificação das Tarefas

| # | Tarefa | Ator Responsável |
|---|--------|-----------------|
| 1 | Criar manutenção e associar prestador | Gestora |
| 2 | Executar serviço | Prestador |
| 3 | Atualizar status do serviço | Gestora |
| 4 | Assinar/Fornecer comprovante | Prestador |
| 5 | Registrar comprovante | Gestora |
| 6 | Consultar histórico | Síndico |

### Detalhamento dos Campos e Comandos

#### Tarefa 3.1 — Criar manutenção e associar prestador

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| id_manutencao | Número | Gerado automaticamente, apenas leitura | |
| prestador_associado | Seleção única | Obrigatório (Lista de prestadores ativos) | |
| descricao_servico | Área de texto | Obrigatório, detalhamento do problema | |
| data_agendamento | Data e Hora | Obrigatório, não pode ser no passado | |
| nivel_prioridade | Seleção única | Obrigatório (Baixa, Média, Alta, Urgente) | Média |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Criar e Notificar | Atividade "Atualizar status do serviço" / "Executar serviço" | default |
| Cancelar | Fim do Processo | cancel |

---

#### Tarefa 3.2 — Executar serviço

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| info_manutencao | Área de texto | Apenas leitura (Detalhes definidos pelo gestor) | |
| fotos_antes_depois | Imagem | Opcional, máximo de 5 imagens (JPG/PNG) | |
| observacoes_tecnicas | Área de texto | Opcional, relato do prestador no local | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Prosseguir | Atividade "Assinar/Fornecer comprovante" | default |

---

#### Tarefa 3.3 — Atualizar status do serviço

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| status_atual | Seleção única | Obrigatório (Em andamento, Aguarda peça, Finalizado) | Em andamento |
| notas_acompanhamento | Área de texto | Opcional, histórico do acompanhamento | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Atualizar | Gateway "Serviço finalizado?" | default |
| Voltar | Atividade "Criar manutenção e associar prestador" | |

---

#### Tarefa 3.4 — Assinar/Fornecer comprovante

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| assinatura_digital | Imagem | Obrigatório (Recolha de assinatura no ecrã) | |
| documento_fiscal | Arquivo | Obrigatório, formatos: PDF, JPG, PNG | |
| valor_pecas_extra | Número | Opcional, formato monetário | 0.00 |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Enviar Comprovativo | Atividade "Registrar comprovante" (Gestor) | default |

---

#### Tarefa 3.5 — Registrar comprovante

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| ficheiros_recebidos | Link | Apenas leitura (Acesso aos anexos do prestador) | |
| valor_total_servico | Número | Obrigatório, validação do custo final | |
| comprovativo_pagamento | Arquivo | Obrigatório, recibo ou transferência (PDF) | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Validar e Registar | Atividade "Consultar histórico" (Síndico) | default |
| Solicitar Correção | Atividade "Assinar/Fornecer comprovante" | |

---

#### Tarefa 3.6 — Consultar histórico

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| detalhes_conclusao | Área de texto | Apenas leitura (Resumo de toda a operação) | |
| tabela_custos | Tabela | Apenas leitura (Matriz com peças e mão de obra) | |
| data_fecho | Data e Hora | Apenas leitura | Data/Hora atual |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Arquivar e Concluir | Fim do Processo | default |
| Exportar PDF | Própria atividade (Download do relatório) | |

---

## Processo 4 — Gestão Financeira (Receitas e Despesas)

[Diagrama BPMN - Processo 4](https://github.com/ICEI-PUC-Minas-PMGES-TI/pmg-es-2026-1-ti2-3740100-sigac/blob/main/docs/processo-4-gest%C3%A3o-de-gastos.md)

### Identificação das Tarefas

| # | Tarefa | Ator Responsável |
|---|--------|-----------------|
| 1 | Registrar receita | Gestora |
| 2 | Registrar despesa | Gestora |
| 3 | Anexar comprovante | Gestora |
| 4 | Gerar relatório | Gestora |
| 5 | Visualizar relatório | Síndico |

### Detalhamento dos Campos e Comandos

#### Tarefa 4.1 — Registrar receita

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| descricao_receita | Caixa de texto | Obrigatório, máximo de 100 caracteres | |
| valor_receita | Número | Obrigatório, valor > 0 (formato monetário) | |
| data_recebimento | Data | Obrigatório, não pode ser data futura | |
| categoria_receita | Seleção única | Obrigatório (Ex: Taxa Condominial, Multa, Aluguel de Salão) | Taxa Condominial |
| unidade_pagadora | Caixa de texto | Obrigatório (Ex: Bloco A, Apto 101) | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Salvar e Continuar | Atividade "Registrar despesa" | default |
| Cancelar | Fim do Processo | cancel |

---

#### Tarefa 4.2 — Registrar despesa

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| descricao_despesa | Caixa de texto | Obrigatório, máximo de 100 caracteres | |
| valor_despesa | Número | Obrigatório, valor > 0 (formato monetário) | |
| data_vencimento | Data | Obrigatório | |
| data_pagamento | Data | Opcional (preencher se já estiver pago) | |
| categoria_despesa | Seleção única | Obrigatório (Ex: Água, Energia, Folha de Pagamento, Manutenção) | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Avançar para Anexos | Atividade "Anexar comprovante" | default |
| Voltar | Atividade "Registrar receita" | |

---

#### Tarefa 4.3 — Anexar comprovante

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| nota_fiscal | Arquivo | Opcional, formatos: PDF, JPG, PNG, máx 5MB | |
| comprovante_pagamento | Arquivo | Obrigatório para despesas pagas (PDF, JPG) | |
| observacoes_lancamento | Área de texto | Opcional, máximo de 300 caracteres | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Salvar Documentos | Atividade "Gerar relatório" | default |
| Voltar | Atividade "Registrar despesa" | |

---

#### Tarefa 4.4 — Gerar relatório

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| periodo_relatorio | Seleção única | Obrigatório (Mensal, Trimestral, Anual) | Mensal |
| mes_referencia | Data | Obrigatório (Selecionar mês/ano) | Mês atual |
| formato_exportacao | Seleção múltipla | Obrigatório (PDF, Excel, CSV) | PDF |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Emitir e Notificar Síndico | Atividade "Visualizar relatório" | default |
| Apenas Emitir | Fim do Processo | |

---

#### Tarefa 4.5 — Visualizar relatório

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| resumo_entradas_saidas | Tabela | Somente leitura (Consolidado de valores) | |
| grafico_balanco | Imagem | Somente leitura (Gráfico gerado pelo sistema) | |
| baixar_relatorio | Link | URL para download do arquivo gerado pelo Gestor | |
| parecer_sindico | Área de texto | Opcional, anotações do síndico após leitura | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Concluir Análise | Fim do Processo | default |
| Imprimir Tela | Própria atividade | |

---

## Processo 5 — Gestão de Avisos e Comunicações

[Diagrama BPMN - Processo 5](https://github.com/ICEI-PUC-Minas-PMGES-TI/pmg-es-2026-1-ti2-3740100-sigac/blob/main/docs/processo-5-gest%C3%A3o-de-avisos.md)

### Identificação das Tarefas

| # | Tarefa | Ator Responsável |
|---|--------|-----------------|
| 1 | Programar manutenção | Gestora |
| 2 | Redigir aviso | Gestora |
| 3 | Selecionar emails para notificação | Gestora |
| 4 | Receber notificações | Inquilino |

### Detalhamento dos Campos e Comandos

#### Tarefa 5.1 — Programar manutenção

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| tipo_manutencao | Seleção única | Obrigatório (Preventiva, Corretiva, Limpeza, etc.) | Preventiva |
| area_afetada | Seleção múltipla | Obrigatório (Elevadores, Garagem, Áreas Comuns, etc.) | |
| data_inicio | Data e Hora | Obrigatório, não pode ser no passado | |
| data_fim_prevista | Data e Hora | Obrigatório, deve ser posterior à data de início | |
| responsavel_tecnico | Caixa de texto | Opcional | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Salvar e Avançar | Atividade "Redigir aviso" | default |
| Cancelar | Fim do Processo | cancel |

---

#### Tarefa 5.2 — Redigir aviso

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| usar_template | Seleção única | Opcional (Lista de modelos pré-cadastrados) | |
| assunto_aviso | Caixa de texto | Obrigatório, máximo de 100 caracteres | Aviso de Manutenção |
| corpo_mensagem | Área de texto | Obrigatório, mínimo de 20 caracteres | |
| arquivo_anexo | Arquivo | Opcional, formatos: PDF, JPG, PNG, máx 5MB | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Preparar Envio | Atividade "Selecionar emails para notificação" | default |
| Voltar | Atividade "Programar manutenção" | |

---

#### Tarefa 5.3 — Selecionar emails para notificação

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| publico_alvo | Seleção única | Obrigatório (Todos, Bloco Específico, Apenas Síndico) | Todos |
| lista_destinatarios | Tabela | Somente leitura (Exibe nome e e-mail filtrados) | |
| agendar_disparo | Data e Hora | Opcional (Se vazio, envia imediatamente) | |
| solicitar_leitura | Seleção múltipla | Marcar para exigir confirmação de leitura | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Disparar Avisos | Atividade "Receber notificações" / Fim do Processo | default |
| Voltar | Atividade "Redigir aviso" | |

---

#### Tarefa 5.4 — Receber notificações

*(Atividade executada na caixa de entrada ou aplicativo do Inquilino)*

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
|-----------|----------|----------------|-------------------|
| remetente | Caixa de texto | Somente leitura | Sistema do Condomínio |
| conteudo_aviso | Área de texto | Somente leitura (Mensagem redigida pelo gestor) | |
| anexo | Link | Somente leitura (Link para baixar documento, se houver) | |
| confirmar_ciencia | Seleção múltipla | Obrigatório se o Gestor exigiu confirmação | |

| **Comando** | **Destino** | **Tipo** |
|-------------|-------------|----------|
| Confirmar e Fechar | Fim do Processo | default |

---

## Modelo de Dados Relacional

```sql
-- =============================================
-- MODELO DE DADOS - SIGAC
-- =============================================

CREATE TABLE condominio (
    id_condominio       INT PRIMARY KEY AUTO_INCREMENT,
    nome_condominio     VARCHAR(100) NOT NULL,
    cnpj                VARCHAR(18),
    qtd_unidades        INT NOT NULL DEFAULT 1 CHECK (qtd_unidades > 0),
    tipo_condominio     ENUM('Residencial', 'Comercial', 'Misto') NOT NULL DEFAULT 'Residencial',
    nome_sindico        VARCHAR(100) NOT NULL,
    email_contato       VARCHAR(150) NOT NULL,
    plano_contratado    ENUM('Basico', 'Intermediario', 'Pro') DEFAULT 'Basico',
    data_hora_ativacao  DATETIME,
    status              ENUM('Pendente', 'Aprovado', 'Rejeitado', 'Ativo') DEFAULT 'Pendente',
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE validacao_cadastro (
    id_validacao        INT PRIMARY KEY AUTO_INCREMENT,
    id_condominio       INT NOT NULL,
    parecer_analise     TEXT,
    status_aprovacao    ENUM('Aprovado', 'Rejeitado') NOT NULL,
    orientacoes_correcao TEXT,
    data_validacao      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_condominio) REFERENCES condominio(id_condominio)
);

CREATE TABLE prestador (
    id_prestador        INT PRIMARY KEY AUTO_INCREMENT,
    nome_completo       VARCHAR(100) NOT NULL,
    cpf_cnpj            VARCHAR(18) NOT NULL UNIQUE,
    especialidade       ENUM('Eletrica', 'Limpeza', 'Hidraulica', 'Manutencao Geral') DEFAULT 'Manutencao Geral',
    telefone_contato    VARCHAR(15) NOT NULL,
    data_contratacao    DATE,
    contrato_prestacao  VARCHAR(500),
    status_cadastro     ENUM('Ativo', 'Inativo', 'Suspenso') DEFAULT 'Ativo',
    avaliacao_servico   INT DEFAULT 5 CHECK (avaliacao_servico BETWEEN 1 AND 5),
    foto_prestador      VARCHAR(500),
    observacoes_gestor  TEXT,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historico_servico_prestador (
    id_historico        INT PRIMARY KEY AUTO_INCREMENT,
    id_prestador        INT NOT NULL,
    descricao_servico   TEXT NOT NULL,
    data_servico        DATE NOT NULL,
    link_pasta_nuvem    VARCHAR(500),
    FOREIGN KEY (id_prestador) REFERENCES prestador(id_prestador)
);

CREATE TABLE manutencao (
    id_manutencao       INT PRIMARY KEY AUTO_INCREMENT,
    id_condominio       INT NOT NULL,
    id_prestador        INT NOT NULL,
    descricao_servico   TEXT NOT NULL,
    data_agendamento    DATETIME NOT NULL,
    nivel_prioridade    ENUM('Baixa', 'Media', 'Alta', 'Urgente') DEFAULT 'Media',
    status_atual        ENUM('Em andamento', 'Aguarda peca', 'Finalizado') DEFAULT 'Em andamento',
    notas_acompanhamento TEXT,
    observacoes_tecnicas TEXT,
    valor_total_servico  DECIMAL(10,2),
    valor_pecas_extra    DECIMAL(10,2) DEFAULT 0.00,
    data_fecho          DATETIME,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_condominio) REFERENCES condominio(id_condominio),
    FOREIGN KEY (id_prestador) REFERENCES prestador(id_prestador)
);

CREATE TABLE comprovante_manutencao (
    id_comprovante      INT PRIMARY KEY AUTO_INCREMENT,
    id_manutencao       INT NOT NULL,
    assinatura_digital  VARCHAR(500) NOT NULL,
    documento_fiscal    VARCHAR(500) NOT NULL,
    comprovativo_pagamento VARCHAR(500),
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_manutencao) REFERENCES manutencao(id_manutencao)
);

CREATE TABLE foto_manutencao (
    id_foto             INT PRIMARY KEY AUTO_INCREMENT,
    id_manutencao       INT NOT NULL,
    caminho_arquivo     VARCHAR(500) NOT NULL,
    tipo                ENUM('antes', 'depois') NOT NULL,
    FOREIGN KEY (id_manutencao) REFERENCES manutencao(id_manutencao)
);

CREATE TABLE receita (
    id_receita          INT PRIMARY KEY AUTO_INCREMENT,
    id_condominio       INT NOT NULL,
    descricao_receita   VARCHAR(100) NOT NULL,
    valor_receita       DECIMAL(10,2) NOT NULL CHECK (valor_receita > 0),
    data_recebimento    DATE NOT NULL,
    categoria_receita   ENUM('Taxa Condominial', 'Multa', 'Aluguel de Salao') DEFAULT 'Taxa Condominial',
    unidade_pagadora    VARCHAR(50) NOT NULL,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_condominio) REFERENCES condominio(id_condominio)
);

CREATE TABLE despesa (
    id_despesa          INT PRIMARY KEY AUTO_INCREMENT,
    id_condominio       INT NOT NULL,
    descricao_despesa   VARCHAR(100) NOT NULL,
    valor_despesa       DECIMAL(10,2) NOT NULL CHECK (valor_despesa > 0),
    data_vencimento     DATE NOT NULL,
    data_pagamento      DATE,
    categoria_despesa   ENUM('Agua', 'Energia', 'Folha de Pagamento', 'Manutencao') NOT NULL,
    nota_fiscal         VARCHAR(500),
    comprovante_pagamento VARCHAR(500),
    observacoes_lancamento TEXT,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_condominio) REFERENCES condominio(id_condominio)
);

CREATE TABLE relatorio_financeiro (
    id_relatorio        INT PRIMARY KEY AUTO_INCREMENT,
    id_condominio       INT NOT NULL,
    periodo_relatorio   ENUM('Mensal', 'Trimestral', 'Anual') DEFAULT 'Mensal',
    mes_referencia      DATE NOT NULL,
    formato_exportacao  VARCHAR(50) NOT NULL DEFAULT 'PDF',
    caminho_arquivo     VARCHAR(500),
    parecer_sindico     TEXT,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_condominio) REFERENCES condominio(id_condominio)
);

CREATE TABLE aviso (
    id_aviso            INT PRIMARY KEY AUTO_INCREMENT,
    id_condominio       INT NOT NULL,
    tipo_manutencao     ENUM('Preventiva', 'Corretiva', 'Limpeza') DEFAULT 'Preventiva',
    area_afetada        VARCHAR(200) NOT NULL,
    data_inicio         DATETIME NOT NULL,
    data_fim_prevista   DATETIME NOT NULL,
    responsavel_tecnico VARCHAR(100),
    assunto_aviso       VARCHAR(100) NOT NULL DEFAULT 'Aviso de Manutencao',
    corpo_mensagem      TEXT NOT NULL,
    arquivo_anexo       VARCHAR(500),
    publico_alvo        ENUM('Todos', 'Bloco Especifico', 'Apenas Sindico') DEFAULT 'Todos',
    agendar_disparo     DATETIME,
    solicitar_leitura   BOOLEAN DEFAULT FALSE,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_condominio) REFERENCES condominio(id_condominio)
);

CREATE TABLE notificacao_aviso (
    id_notificacao      INT PRIMARY KEY AUTO_INCREMENT,
    id_aviso            INT NOT NULL,
    email_destinatario  VARCHAR(150) NOT NULL,
    nome_destinatario   VARCHAR(100),
    confirmou_ciencia   BOOLEAN DEFAULT FALSE,
    data_confirmacao    DATETIME,
    FOREIGN KEY (id_aviso) REFERENCES aviso(id_aviso)
);
```

---

## Quadro Resumo

| Processo | Nr de Tarefas | Atores Envolvidos | Nr Total de Campos |
|----------|:------------:|-------------------|:------------------:|
| 1 - Cadastro de Condominios | 4 | Gestora, Dep. Cadastro | 15 |
| 2 - Cadastro de Funcionarios | 3 | Gestora, Sindico | 14 |
| 3 - Gestao de Manutencao | 6 | Gestora, Prestador, Sindico | 17 |
| 4 - Gestao Financeira | 5 | Gestora, Sindico | 17 |
| 5 - Gestao de Avisos | 4 | Gestora, Inquilino | 14 |
| **TOTAL** | **22** | **5 atores distintos** | **77** |