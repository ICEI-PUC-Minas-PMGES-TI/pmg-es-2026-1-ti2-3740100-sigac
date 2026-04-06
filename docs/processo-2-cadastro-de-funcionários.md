### 3.3.2 Processo 2 – Cadastro de funcionários


![Exemplo de um Modelo BPMN do PROCESSO 2](images/Sigac%20BPMN%20Prestadores.jpg "Modelo BPMN do Processo 2.")

**Nome do Processo:** Cadastro e Histórico de Prestadores de Serviço

**Oportunidades de melhoria:**

  * **Consulta Automática de Antecedentes/Receita Federal:** Integrar o formulário de cadastro com APIs públicas para validar automaticamente o CPF/CNPJ do prestador e preencher dados básicos de forma automática, economizando tempo do Gestor.
  * **Notificação de Atualização:** Implementar um envio de notificação automática (via e-mail ou push no aplicativo) para o Síndico assim que o Gestor concluir a etapa de "Editar dados do prestador", garantindo que o Síndico saiba que há um histórico novo para visualizar.

#### Detalhamento das atividades

**Cadastrar dados do prestador**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| nome\_completo | Caixa de texto | Obrigatório, máximo de 100 caracteres | |
| cpf\_cnpj | Caixa de texto | Obrigatório, formato de CPF ou CNPJ | |
| especialidade | Seleção única | Obrigatório (Ex: Elétrica, Limpeza, Hidráulica) | Manutenção Geral |
| telefone\_contato | Caixa de texto | Obrigatório, formato (XX) XXXXX-XXXX | |
| data\_contratacao | Data | Não pode ser data futura | |
| contrato\_prestacao | Arquivo | Opcional, formatos permitidos: PDF, máx 5MB | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Salvar e Continuar | Atividade "Editar dados do prestador" | default |
| Cancelar | Fim do Processo | cancel |

**Editar dados do prestador**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| status\_cadastro | Seleção única | Obrigatório (Ativo, Inativo, Suspenso) | Ativo |
| avaliacao\_servico | Número | De 1 a 5 | 5 |
| foto\_prestador | Imagem | Opcional, formatos permitidos: JPG, PNG, máx 2MB | |
| observacoes\_gestor | Área de texto | Opcional, máximo de 500 caracteres | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Atualizar Dados | Atividade "Visualizar histórico" (Síndico) | default |
| Voltar | Atividade "Cadastrar dados do prestador" | |

**Visualizar histórico**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| dados\_cadastrais | Área de texto | Somente leitura (Exibe o resumo do cadastro) | |
| historico\_servicos | Tabela | Somente leitura (Lista de serviços prestados e datas) | |
| data\_hora\_consulta | Data e Hora | Somente leitura, gerado pelo sistema | Data/Hora atual |
| link\_pasta\_nuvem | Link | URL para a pasta com documentos físicos escaneados | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Concluir | Fim do Processo | default |
| Imprimir Histórico | Própria atividade (Gera PDF do histórico) | |
