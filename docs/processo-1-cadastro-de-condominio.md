### 3.3.1 Processo 1 – Cadastro de condomínios

**Nome do Processo:** Cadastro de Condomínios
![Exemplo de um Modelo BPMN do PROCESSO 1](images/Processo%20de%20cadastro%20de%20condomínios.png "Modelo BPMN do Processo 1.")
**Oportunidades de melhoria:**

  * **Automação na Validação:** Integrar o formulário de cadastro com a API da Receita Federal para validar automaticamente o CNPJ e preencher dados básicos (Razão Social, Endereço), reduzindo o tempo e a taxa de erro humano no momento do preenchimento.


#### Detalhamento das atividades

**Preencher formulário**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| ---                       | ---              | ---                                      | ---               |
| nome\_condominio           | Caixa de texto   | Obrigatório, máximo de 100 caracteres    |                   |
| cnpj                      | Caixa de texto   | Obrigatório, formato de CNPJ (XX.XXX.XXX/XXXX-XX) |                   |
| qtd\_unidades              | Número           | Obrigatório, valor \> 0                   | 1                 |
| data\_fundacao             | Data             | Não pode ser data futura                 |                   |
| tipo\_condominio           | Seleção única    | Obrigatório (Residencial, Comercial, Misto)| Residencial       |
| nome\_sindico              | Caixa de texto   | Obrigatório                              |                   |
| email\_contato             | Caixa de texto   | Obrigatório, formato de e-mail           |                   |

| **Comandos** | **Destino** | **Tipo** |
| ---                   | ---                                      | ---      |
| Salvar e Avançar      | Atividade "Anexar documentos"            | default  |
| Cancelar              | Fim do Processo (Cancelamento)           | cancel   |

**Anexar documentos**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| ---                       | ---              | ---                                      | ---               |
| cartao\_cnpj               | Arquivo          | Obrigatório, formatos permitidos: PDF, JPG, PNG, máx 5MB |                   |
| ata\_eleicao\_sindico       | Arquivo          | Obrigatório, formato permitido: PDF, máx 10MB |                   |
| convencao\_condominial     | Arquivo          | Opcional, formato permitido: PDF, máx 20MB |                   |
| observacoes\_adicionais    | Área de texto    | Opcional, máximo de 500 caracteres       |                   |

| **Comandos** | **Destino** | **Tipo** |
| ---                   | ---                                      | ---      |
| Enviar para Validação | Atividade "Validar cadastro" (Dep. Cadastro)| default  |
| Voltar                | Atividade "Preencher formulário"         |          |

**Validar cadastro**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| ---                       | ---              | ---                                      | ---               |
| dados\_formulario          | Tabela           | Somente leitura (Exibe dados preenchidos)|                   |
| documentos\_anexados       | Link             | Somente leitura (Links para download)    |                   |
| parecer\_analise           | Área de texto    | Obrigatório caso o cadastro seja rejeitado|                   |
| status\_aprovacao          | Seleção única    | Obrigatório (Aprovado, Rejeitado)        |                   |

| **Comandos** | **Destino** | **Tipo** |
| ---                   | ---                                      | ---      |
| Confirmar Análise     | Gateway "Cadastro validado?"             | default  |
| Salvar Rascunho       | Própria atividade (Validar cadastro)     |          |

**Solicitar correções**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| ---                       | ---              | ---                                      | ---               |
| motivo\_rejeicao           | Área de texto    | Obrigatório, preenchido na validação     | Parecer da análise|
| orientacoes\_correcao      | Área de texto    | Obrigatório, máximo de 1000 caracteres   |                   |

| **Comandos** | **Destino** | **Tipo** |
| ---                   | ---                                      | ---      |
| Enviar Notificação    | Atividade "Receber e-mail de pendência"  | default  |
| Cancelar              | Atividade "Validar cadastro"             | cancel   |

**Ativar registro e acesso**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| ---                       | ---              | ---                                      | ---               |
| id\_sistema\_condominio     | Número           | Gerado automaticamente, somente leitura  |                   |
| data\_hora\_ativacao        | Data e Hora      | Somente leitura                          | Data/Hora atual   |
| plano\_contratado          | Seleção única    | Obrigatório (Básico, Intermediário, Pro) | Básico            |
| enviar\_credenciais        | Seleção múltipla | Marcar para enviar e-mail com senha      | Selecionado       |

| **Comandos** | **Destino** | **Tipo** |
| ---                   | ---                                      | ---      |
| Concluir Ativação     | Fim do Processo                          | default  |
| Voltar                | Atividade "Validar cadastro"             |          |
