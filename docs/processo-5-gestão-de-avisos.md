### 3.3.5 Processo 5 – Avisos

**Nome do Processo:** Gestão de Avisos e Comunicações
![Exemplo de um Modelo BPMN do PROCESSO 5](images/Sigac%20BPMN%20Avisos.jpg "Modelo BPMN do Processo 5.")

**Oportunidades de melhoria:**

  * **Templates pré-definidos:** Criar uma biblioteca de modelos de mensagens prontos na etapa "Redigir aviso" (ex: falta de água, manutenção de elevador, dedetização), agilizando o trabalho do Gestor e garantindo padronização na comunicação.
  * **Múltiplos Canais de Envio:** Além de "Selecionar emails", expandir a notificação para disparos via WhatsApp, SMS ou notificações push no aplicativo do condomínio, garantindo que a informação chegue mais rápido aos Inquilinos.

#### Detalhamento das atividades

**Programar manutenção**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| tipo\_manutencao | Seleção única | Obrigatório (Preventiva, Corretiva, Limpeza, etc.) | Preventiva |
| area\_afetada | Seleção múltipla | Obrigatório (Elevadores, Garagem, Áreas Comuns, etc.) | |
| data\_inicio | Data e Hora | Obrigatório, não pode ser no passado | |
| data\_fim\_prevista | Data e Hora | Obrigatório, deve ser posterior à data de início | |
| responsavel\_tecnico | Caixa de texto | Opcional | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Salvar e Avançar | Atividade "Redigir aviso" | default |
| Cancelar | Fim do Processo | cancel |

**Redigir aviso**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| usar\_template | Seleção única | Opcional (Lista de modelos pré-cadastrados) | |
| assunto\_aviso | Caixa de texto | Obrigatório, máximo de 100 caracteres | Aviso de Manutenção |
| corpo\_mensagem | Área de texto | Obrigatório, mínimo de 20 caracteres | |
| arquivo\_anexo | Arquivo | Opcional, formatos: PDF, JPG, PNG, máx 5MB | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Preparar Envio | Atividade "Selecionar emails para notificação" | default |
| Voltar | Atividade "Programar manutenção" | |

**Selecionar emails para notificação**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| publico\_alvo | Seleção única | Obrigatório (Todos, Bloco Específico, Apenas Síndico) | Todos |
| lista\_destinatarios | Tabela | Somente leitura (Exibe nome e e-mail filtrados) | |
| agendar\_disparo | Data e Hora | Opcional (Se vazio, envia imediatamente) | |
| solicitar\_leitura | Seleção múltipla | Marcar para exigir confirmação de leitura | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Disparar Avisos | Atividade "Receber notificações" / Fim do Processo | default |
| Voltar | Atividade "Redigir aviso" | |

**Receber notificações**

*(Esta atividade ocorre na caixa de entrada ou aplicativo do Inquilino)*

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| remetente | Caixa de texto | Somente leitura | Sistema do Condomínio |
| conteudo\_aviso | Área de texto | Somente leitura (Mensagem redigida pelo gestor) | |
| anexo | Link | Somente leitura (Link para baixar documento, se houver) | |
| confirmar\_ciencia | Seleção múltipla | Obrigatório se o Gestor exigiu confirmação | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Confirmar e Fechar | Fim do Processo | default |
