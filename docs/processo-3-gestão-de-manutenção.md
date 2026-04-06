### 3.3.3 Processo 3 – Gestão de manuteção

**Nome do Processo:** Gestão de Manutenção

![Exemplo de um Modelo BPMN do PROCESSO 3](images/Sigac%20BPMN%20G%26M.jpg "Modelo BPMN do Processo 3.")

**Oportunidades de melhoria:**

  * **Notificações automáticas integradas:** Implementar o envio automático de alertas (SMS ou e-mail) para o Prestador de serviços assim que a manutenção for criada, e para o Síndico quando o status for atualizado, reduzindo falhas de comunicação.
  * **Envio mobile de comprovativos:** Permitir que o próprio Prestador anexe os comprovativos e notas fiscais diretamente através de uma aplicação móvel no local da "Execução do serviço", automatizando a etapa de "Registrar comprovante" que atualmente depende do Gestor.

#### Detalhamento das atividades

**Criar manutenção e associar prestador**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| id\_manutencao | Número | Gerado automaticamente, apenas leitura | |
| prestador\_associado | Seleção única | Obrigatório (Lista de prestadores ativos) | |
| descricao\_servico | Área de texto | Obrigatório, detalhamento do problema | |
| data\_agendamento | Data e Hora | Obrigatório, não pode ser no passado | |
| nivel\_prioridade | Seleção única | Obrigatório (Baixa, Média, Alta, Urgente) | Média |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Criar e Notificar | Atividade "Atualizar status do serviço" / "Executar serviço" | default |
| Cancelar | Fim do Processo | cancel |

**Executar serviço**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| info\_manutencao | Área de texto | Apenas leitura (Detalhes definidos pelo gestor) | |
| fotos\_antes\_depois | Imagem | Opcional, máximo de 5 imagens (JPG/PNG) | |
| observacoes\_tecnicas | Área de texto | Opcional, relato do prestador no local | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Prosseguir | Atividade "Assinar/Fornecer comprovante" | default |

**Atualizar status do serviço**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| status\_atual | Seleção única | Obrigatório (Em andamento, Aguarda peça, Finalizado) | Em andamento |
| notas\_acompanhamento | Área de texto | Opcional, histórico do acompanhamento | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Atualizar | Gateway "Serviço finalizado?" | default |
| Voltar | Atividade "Criar manutenção e associar prestador" | |

**Assinar/Fornecer comprovante**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| assinatura\_digital | Imagem | Obrigatório (Recolha de assinatura no ecrã) | |
| documento\_fiscal | Arquivo | Obrigatório, formatos: PDF, JPG, PNG | |
| valor\_pecas\_extra | Número | Opcional, formato monetário | 0.00 |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Enviar Comprovativo | Atividade "Registrar comprovante" (Gestor) | default |

**Registrar comprovante**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| ficheiros\_recebidos | Link | Apenas leitura (Acesso aos anexos do prestador) | |
| valor\_total\_servico | Número | Obrigatório, validação do custo final | |
| comprovativo\_pagamento| Arquivo | Obrigatório, recibo ou transferência (PDF) | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Validar e Registar | Atividade "Consultar histórico" (Síndico) | default |
| Solicitar Correção | Atividade "Assinar/Fornecer comprovante" | |

**Consultar histórico**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| detalhes\_conclusao | Área de texto | Apenas leitura (Resumo de toda a operação) | |
| tabela\_custos | Tabela | Apenas leitura (Matriz com peças e mão de obra) | |
| data\_fecho | Data e Hora | Apenas leitura | Data/Hora atual |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Arquivar e Concluir | Fim do Processo | default |
| Exportar PDF | Própria atividade (Download do relatório) | |
