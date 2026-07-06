## 5. Indicadores de desempenho

_Os indicadores abaixo foram definidos de forma alinhada aos nomes dos processos do SIGAC e as informações necessárias para gerá-los estão contempladas no modelo relacional._

_Usar o seguinte modelo:_

| **Indicador** | **Objetivo** | **Descrição** | **Fonte de dados** | **Fórmula de cálculo** |
| --- | --- | --- | --- | --- |
| Taxa de manutenções concluídas | Medir a eficiência do processo **Gestão de Manutenção** | Percentual de manutenções finalizadas em relação ao total de manutenções registradas no período | Tabela `manutencao` | (número de manutenções com status_atual = 'Finalizado' / número total de manutenções) * 100 |
| Tempo médio de resolução de manutenção | Avaliar a agilidade do processo **Gestão de Manutenção** | Mede o tempo médio entre a abertura da manutenção e seu fechamento | Tabela `manutencao` | soma da diferença entre `data_fecho` e `created_at` / número de manutenções finalizadas |
| Saldo financeiro do período | Acompanhar o desempenho do processo **Gestão Financeira (Receitas e Despesas)** | Diferença entre o total de receitas e o total de despesas registradas no período | Tabelas `receita` e `despesa` | soma dos valores de receita - soma dos valores de despesa |
| Índice de inadimplência | Monitorar o controle financeiro do processo **Gestão Financeira (Receitas e Despesas)** | Percentual de receitas previstas que não foram recebidas até a data esperada no período analisado | Tabela `receita` | (número de receitas não recebidas no prazo / número total de receitas previstas) * 100 |

_Obs.: todas as informações para gerar os indicadores devem estar no modelo relacional._
