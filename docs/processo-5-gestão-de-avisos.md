### 3.3.5 Processo 5 – Avisos

**Nome do Processo:** Gestão de Avisos e Comunicações
![Exemplo de um Modelo BPMN do PROCESSO 5](images/Sigac%20BPMN%20Avisos.jpg "Modelo BPMN do Processo 5.")

**Oportunidades de melhoria:**

  * **Templates pré-definidos:** Criar uma biblioteca de modelos de mensagens prontos na etapa "Redigir aviso" (ex: falta de água, manutenção de elevador, dedetização), agilizando o trabalho do [...]
  * **Múltiplos Canais de Envio:** Além de "Selecionar emails", expandir a notificação para disparos via WhatsApp, SMS ou notificações push no aplicativo do condomínio, garantindo que a informa[...]

#### Detalhamento das atividades

**Programar manutenção**

> **Alinhamento com UI:** Corresponde ao fluxo do Gestor na **"Tela de manutenções"** (UI 3.5), ao acionar **"Nova manutenção"**.

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| tipo_manutencao | Seleção única | Obrigatório (Preventiva, Corretiva, Limpeza, etc.) | Preventiva |
| area_afetada | Seleção múltipla | Obrigatório (Elevadores, Garagem, Áreas Comuns, etc.) | |
| data_inicio | Data e Hora | Obrigatório, não pode ser no passado | |
| data_fim_prevista | Data e Hora | Obrigatório, deve ser posterior à data de início | |
| responsavel_tecnico | Caixa de texto | Opcional | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Salvar e Avançar | Atividade "Redigir aviso" | default |
| Cancelar | Fim do Processo | cancel |

**Redigir aviso**

> **Alinhamento com UI:** **A definir no wireframe.** Recomenda-se criar uma tela/modal específica no fluxo do Gestor em `docs/ui/_ui.md` (ex.: **"Tela de avisos / Redigir aviso"**).

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| usar_template | Seleção única | Opcional (Lista de modelos pré-cadastrados) | |
| assunto_aviso | Caixa de texto | Obrigatório, máximo de 100 caracteres | Aviso de Manutenção |
| corpo_mensagem | Área de texto | Obrigatório, mínimo de 20 caracteres | |
| arquivo_anexo | Arquivo | Opcional, formatos: PDF, JPG, PNG, máx 5MB | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Preparar Envio | Atividade "Selecionar emails para notificação" | default |
| Voltar | Atividade "Programar manutenção" | |

**Selecionar emails para notificação**

> **Alinhamento com UI:** **A definir no wireframe.** Recomenda-se criar uma tela/modal no fluxo do Gestor (ex.: **"Selecionar destinatários"**) em `docs/ui/_ui.md`.

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| publico_alvo | Seleção única | Obrigatório (Todos, Bloco Específico, Apenas Síndico) | Todos |
| lista_destinatarios | Tabela | Somente leitura (Exibe nome e e-mail filtrados) | |
| agendar_disparo | Data e Hora | Opcional (Se vazio, envia imediatamente) | |
| solicitar_leitura | Seleção múltipla | Marcar para exigir confirmação de leitura | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Disparar Avisos | Atividade "Receber notificações" / Fim do Processo | default |
| Voltar | Atividade "Redigir aviso" | |

**Receber notificações**

*(Esta atividade ocorre na caixa de entrada ou aplicativo do Inquilino)*

> **Alinhamento com UI:** **A definir no wireframe.** Recomenda-se criar um fluxo/perfil de **Inquilino** em `docs/ui/_ui.md` com uma tela de **"Notificações / Caixa de entrada"**.

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| remetente | Caixa de texto | Somente leitura | Sistema do Condomínio |
| conteudo_aviso | Área de texto | Somente leitura (Mensagem redigida pelo gestor) | |
| anexo | Link | Somente leitura (Link para baixar documento, se houver) | |
| confirmar_ciencia | Seleção múltipla | Obrigatório se o Gestor exigiu confirmação | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Confirmar e Fechar | Fim do Processo | default |
